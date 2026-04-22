
// ─────────────────────────────────────────────
// Metrics Engine — calculates the 5 DORA/productivity metrics
// from workbook-defined source tables, then interprets them.
// ─────────────────────────────────────────────

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY  = MS_PER_HOUR * 24;

// ── 1. Lead Time for Changes ─────────────────
// Avg hours from PR opened → successful production deployment
export function calcLeadTime(devId, pullRequests, deployments) {
  const devPRs  = pullRequests.filter(p => p.dev === devId && p.status === "merged");
  const devDeps = deployments.filter(d => d.dev === devId && d.status === "success");

  const depsByPR = Object.fromEntries(devDeps.map(d => [d.prId, d]));

  const leadTimes = devPRs
    .filter(pr => depsByPR[pr.id])
    .map(pr => {
      const opened   = new Date(pr.openedAt).getTime();
      const deployed = new Date(depsByPR[pr.id].deployedAt).getTime();
      return (deployed - opened) / MS_PER_HOUR;
    });

  if (!leadTimes.length) return 0;
  const avg = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
  return parseFloat(avg.toFixed(1));
}

// ── 2. Cycle Time ────────────────────────────
// Avg days from issue moved to "In Progress" → marked "Done"
export function calcCycleTime(devId, issues) {
  const devIssues = issues.filter(i => i.dev === devId && i.status === "Done");

  const cycleTimes = devIssues.map(i => {
    const start = new Date(i.inProgressAt).getTime();
    const end   = new Date(i.doneAt).getTime();
    return (end - start) / MS_PER_DAY;
  });

  if (!cycleTimes.length) return 0;
  const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
  return parseFloat(avg.toFixed(1));
}

// ── 3. Bug Rate ──────────────────────────────
// Production bugs escaped / issues completed (in the month)
export function calcBugRate(devId, bugs, issues) {
  const devBugs   = bugs.filter(b => b.dev === devId);
  const devIssues = issues.filter(i => i.dev === devId && i.status === "Done");
  if (!devIssues.length) return 0;
  return parseFloat((devBugs.length / devIssues.length).toFixed(2));
}

// ── 4. Deployment Frequency ──────────────────
// Count of successful production deployments in the month
export function calcDeployFreq(devId, deployments) {
  return deployments.filter(d => d.dev === devId && d.status === "success").length;
}

// ── 5. PR Throughput ─────────────────────────
// Count of merged PRs in the month
export function calcPRThroughput(devId, pullRequests) {
  return pullRequests.filter(p => p.dev === devId && p.status === "merged").length;
}

// ── Aggregate all metrics for a developer ────
export function getMetrics(devId, { issues, pullRequests, deployments, bugs }) {
  return {
    leadTime:      calcLeadTime(devId, pullRequests, deployments),
    cycleTime:     calcCycleTime(devId, issues),
    bugRate:       calcBugRate(devId, bugs, issues),
    deployFreq:    calcDeployFreq(devId, deployments),
    prThroughput:  calcPRThroughput(devId, pullRequests),
  };
}

// ── Score: 0-100 per metric (higher = healthier) ──
function scoreLeadTime(hours)     { if (hours <= 24) return 100; if (hours <= 48) return 80; if (hours <= 72) return 60; if (hours <= 120) return 40; return 20; }
function scoreCycleTime(days)     { if (days <= 4)   return 100; if (days <= 6)   return 80; if (days <= 9)   return 60; if (days <= 12)  return 40; return 20; }
function scoreBugRate(rate)       { if (rate <= 0.1) return 100; if (rate <= 0.2) return 80; if (rate <= 0.35) return 60; if (rate <= 0.6) return 40; return 20; }
function scoreDeployFreq(count)   { if (count >= 8)  return 100; if (count >= 5)  return 80; if (count >= 3)  return 60; if (count >= 1)  return 40; return 20; }
function scorePRThroughput(count) { if (count >= 8)  return 100; if (count >= 5)  return 80; if (count >= 3)  return 60; if (count >= 1)  return 40; return 20; }

export function scoreMetrics(metrics) {
  return {
    leadTime:     scoreLeadTime(metrics.leadTime),
    cycleTime:    scoreCycleTime(metrics.cycleTime),
    bugRate:      scoreBugRate(metrics.bugRate),
    deployFreq:   scoreDeployFreq(metrics.deployFreq),
    prThroughput: scorePRThroughput(metrics.prThroughput),
    overall: Math.round(
      (scoreLeadTime(metrics.leadTime) +
       scoreCycleTime(metrics.cycleTime) +
       scoreBugRate(metrics.bugRate) +
       scoreDeployFreq(metrics.deployFreq) +
       scorePRThroughput(metrics.prThroughput)) / 5
    ),
  };
}

// ── Interpretation engine ─────────────────────
// Returns a human-readable story for each metric
export function interpretMetrics(metrics) {
  const interpretations = {};

  // Lead Time
  if (metrics.leadTime <= 24)
    interpretations.leadTime = { status: "excellent", label: "Excellent", story: "Your changes are reaching production within a day. This indicates a healthy, automated pipeline with minimal review bottlenecks." };
  else if (metrics.leadTime <= 48)
    interpretations.leadTime = { status: "good", label: "Good", story: "Lead time is within 2 days — solid delivery pace. Small optimisations in review turnaround could push this to excellent." };
  else if (metrics.leadTime <= 72)
    interpretations.leadTime = { status: "fair", label: "Fair", story: "Changes take 2–3 days to reach production. Review wait times or CI/CD pipeline steps might be adding friction." };
  else
    interpretations.leadTime = { status: "poor", label: "Needs Attention", story: "Lead time exceeds 3 days. Look for review bottlenecks, long-running test suites, or manual deployment gates slowing delivery." };

  // Cycle Time
  if (metrics.cycleTime <= 4)
    interpretations.cycleTime = { status: "excellent", label: "Excellent", story: "Tasks move from In Progress to Done swiftly. You're breaking work into small, ship-ready chunks — great discipline." };
  else if (metrics.cycleTime <= 6)
    interpretations.cycleTime = { status: "good", label: "Good", story: "Cycle time is healthy. Slightly finer-grained tickets could reduce it further and keep momentum visible." };
  else if (metrics.cycleTime <= 9)
    interpretations.cycleTime = { status: "fair", label: "Fair", story: "Tasks are spending 7–9 days in progress. This can signal unclear requirements, large ticket scope, or external blockers." };
  else
    interpretations.cycleTime = { status: "poor", label: "Needs Attention", story: "Long cycle times (>9 days) often mean tickets are too large, there are hidden dependencies, or progress is blocked by external teams." };

  // Bug Rate
  if (metrics.bugRate <= 0.1)
    interpretations.bugRate = { status: "excellent", label: "Excellent", story: "Very few bugs escaping to production. Strong testing habits, careful reviews, and reliable CI gates are working well." };
  else if (metrics.bugRate <= 0.2)
    interpretations.bugRate = { status: "good", label: "Good", story: "Bug rate is low. Consider adding property-based or integration tests in areas where bugs tend to cluster." };
  else if (metrics.bugRate <= 0.35)
    interpretations.bugRate = { status: "fair", label: "Fair", story: "About 1 in 3 completed items generates a production bug. Review coverage for edge cases and explore pre-merge staging checks." };
  else
    interpretations.bugRate = { status: "poor", label: "Needs Attention", story: "High bug escape rate suggests gaps in test coverage, rushed reviews, or missing staging validation. Prioritise test-first practices." };

  // Deploy Frequency
  if (metrics.deployFreq >= 8)
    interpretations.deployFreq = { status: "excellent", label: "Excellent", story: "Deploying multiple times a week. You're operating at elite-level delivery cadence with strong automation." };
  else if (metrics.deployFreq >= 5)
    interpretations.deployFreq = { status: "good", label: "Good", story: "Good deployment frequency — roughly weekly. Slightly more frequent merges could reduce deployment batch size and risk." };
  else if (metrics.deployFreq >= 3)
    interpretations.deployFreq = { status: "fair", label: "Fair", story: "Deploying 3–4× a month. Consider breaking larger features into smaller releases to ship more often with less risk." };
  else
    interpretations.deployFreq = { status: "poor", label: "Needs Attention", story: "Low deployment frequency often signals large batched changes, lack of feature flags, or manual approval gates. Small, frequent deploys reduce risk." };

  // PR Throughput
  if (metrics.prThroughput >= 8)
    interpretations.prThroughput = { status: "excellent", label: "Excellent", story: "High PR throughput shows effective breakdown of work and fast review cycles — a hallmark of high-performing developers." };
  else if (metrics.prThroughput >= 5)
    interpretations.prThroughput = { status: "good", label: "Good", story: "Solid PR throughput. Aim to keep PRs small and focused to maintain this pace and improve review quality." };
  else if (metrics.prThroughput >= 3)
    interpretations.prThroughput = { status: "fair", label: "Fair", story: "3–4 merged PRs per month. Splitting large PRs into smaller logical units can speed up reviews and reduce integration risk." };
  else
    interpretations.prThroughput = { status: "poor", label: "Needs Attention", story: "Very few PRs merged. Look at whether PRs are sitting in review for long, or if work is being chunked into very large batches." };

  return interpretations;
}

// ── Next Steps generator ──────────────────────
export function generateNextSteps(metrics, scores) {
  const steps = [];

  // Find the two lowest scoring metrics
  const ranked = [
    { key: "leadTime",     score: scores.leadTime,     value: metrics.leadTime },
    { key: "cycleTime",    score: scores.cycleTime,    value: metrics.cycleTime },
    { key: "bugRate",      score: scores.bugRate,      value: metrics.bugRate },
    { key: "deployFreq",   score: scores.deployFreq,   value: metrics.deployFreq },
    { key: "prThroughput", score: scores.prThroughput, value: metrics.prThroughput },
  ].sort((a, b) => a.score - b.score);

  const actionMap = {
    leadTime: [
      { title: "Audit your CI/CD pipeline", detail: "Find and eliminate slow test suites or manual gates. Aim to get pipeline duration under 15 minutes.", priority: "High", effort: "Medium", impact: "High" },
      { title: "Set a PR review SLA", detail: "Work with your team to agree on a 4-hour first-review target. Faster reviews directly cut lead time.", priority: "High", effort: "Low", impact: "High" },
    ],
    cycleTime: [
      { title: "Break tickets into <3-day tasks", detail: "If a ticket takes more than 3 days, split it. Smaller work units stay unblocked and finish faster.", priority: "High", effort: "Low", impact: "High" },
      { title: "Daily blocker check-in", detail: "Flag blockers in standup the moment they appear. Hidden blockers are the #1 cause of long cycle times.", priority: "Medium", effort: "Low", impact: "Medium" },
    ],
    bugRate: [
      { title: "Add tests before merging", detail: "Write at least one integration and one edge-case unit test per PR. This directly reduces escaped bugs.", priority: "High", effort: "Medium", impact: "High" },
      { title: "Review staging environment coverage", detail: "Ensure staging mirrors production data shapes. Bugs often escape because staging misses edge conditions.", priority: "High", effort: "Medium", impact: "High" },
    ],
    deployFreq: [
      { title: "Use feature flags to ship smaller", detail: "Wrap in-progress features in feature flags so you can deploy daily without exposing incomplete work.", priority: "Medium", effort: "Medium", impact: "High" },
      { title: "Reduce PR size to 1 logical change", detail: "Smaller PRs get reviewed faster and deploy more frequently. Aim for ≤400 lines changed per PR.", priority: "Medium", effort: "Low", impact: "Medium" },
    ],
    prThroughput: [
      { title: "Draft PRs early for visibility", detail: "Open a draft PR as soon as you start a feature. This gives reviewers early context and can reduce review time later.", priority: "Medium", effort: "Low", impact: "Medium" },
      { title: "Timebox review wait time", detail: "If a PR is not reviewed in 24 hours, proactively ping reviewers or async the review. Don't let PRs sit idle.", priority: "High", effort: "Low", impact: "Medium" },
    ],
  };

  // Take top 2 lowest-scoring metrics and pick one action each
  const top2 = ranked.slice(0, 2);
  top2.forEach(({ key }) => {
    const actions = actionMap[key];
    if (actions && actions[0]) steps.push({ ...actions[0], metric: key });
    if (actions && actions[1] && steps.length < 3) steps.push({ ...actions[1], metric: key });
  });

  return steps.slice(0, 3);
}
