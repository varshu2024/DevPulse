/**
 * metricsEngine.js  — Server-side calculation of the 5 productivity metrics
 * Implements the exact workbook definitions:
 *
 *  1. Lead Time      : avg hours from PR opened → successful prod deployment
 *  2. Cycle Time     : avg days from issue In-Progress → issue Done
 *  3. Bug Rate       : escaped prod bugs / issues completed in the month
 *  4. Deploy Freq    : count of successful prod deployments in the month
 *  5. PR Throughput  : count of merged pull requests in the month
 */

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY  = MS_PER_HOUR * 24;

// ── 1. Lead Time for Changes ─────────────────────────────────────────────────
function calcLeadTime(devId, pullRequests, deployments) {
  const mergedPRs   = pullRequests.filter(p => p.devId === devId && p.status === 'merged');
  const successDeps = deployments.filter(d => d.devId === devId && d.status === 'success');

  // Index deployments by prId for O(1) lookup
  const depByPR = {};
  successDeps.forEach(d => { depByPR[d.prId] = d; });

  const leadTimes = mergedPRs
    .filter(pr => depByPR[pr.id])
    .map(pr => {
      const opened   = new Date(pr.openedAt).getTime();
      const deployed = new Date(depByPR[pr.id].deployedAt).getTime();
      return (deployed - opened) / MS_PER_HOUR;
    });

  if (!leadTimes.length) return 0;
  const avg = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
  return parseFloat(avg.toFixed(1));
}

// ── 2. Cycle Time ────────────────────────────────────────────────────────────
function calcCycleTime(devId, issues) {
  const doneIssues = issues.filter(i => i.devId === devId && i.status === 'Done');

  const cycleTimes = doneIssues.map(i => {
    const start = new Date(i.inProgressAt).getTime();
    const end   = new Date(i.doneAt).getTime();
    return (end - start) / MS_PER_DAY;
  });

  if (!cycleTimes.length) return 0;
  const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
  return parseFloat(avg.toFixed(1));
}

// ── 3. Bug Rate ───────────────────────────────────────────────────────────────
function calcBugRate(devId, bugs, issues) {
  const devBugs   = bugs.filter(b => b.devId === devId);
  const doneIssues = issues.filter(i => i.devId === devId && i.status === 'Done');
  if (!doneIssues.length) return 0;
  return parseFloat((devBugs.length / doneIssues.length).toFixed(2));
}

// ── 4. Deployment Frequency ───────────────────────────────────────────────────
function calcDeployFreq(devId, deployments) {
  return deployments.filter(d => d.devId === devId && d.status === 'success').length;
}

// ── 5. PR Throughput ──────────────────────────────────────────────────────────
function calcPRThroughput(devId, pullRequests) {
  return pullRequests.filter(p => p.devId === devId && p.status === 'merged').length;
}

// ── Aggregate all 5 metrics ───────────────────────────────────────────────────
function computeMetrics(devId, { issues, pullRequests, deployments, bugs }) {
  return {
    leadTime:     calcLeadTime(devId, pullRequests, deployments),
    cycleTime:    calcCycleTime(devId, issues),
    bugRate:      calcBugRate(devId, bugs, issues),
    deployFreq:   calcDeployFreq(devId, deployments),
    prThroughput: calcPRThroughput(devId, pullRequests),
  };
}

// ── Health scoring rubric (0-100 per metric, higher = healthier) ──────────────
function scoreLeadTime(h)     { if (h <= 24)   return 100; if (h <= 48)   return 80; if (h <= 72)  return 60; if (h <= 120) return 40; return 20; }
function scoreCycleTime(d)    { if (d <= 4)    return 100; if (d <= 6)    return 80; if (d <= 9)   return 60; if (d <= 12)  return 40; return 20; }
function scoreBugRate(r)      { if (r <= 0.1)  return 100; if (r <= 0.2)  return 80; if (r <= 0.35) return 60; if (r <= 0.6) return 40; return 20; }
function scoreDeployFreq(c)   { if (c >= 8)    return 100; if (c >= 5)    return 80; if (c >= 3)   return 60; if (c >= 1)   return 40; return 20; }
function scorePRThroughput(c) { if (c >= 8)    return 100; if (c >= 5)    return 80; if (c >= 3)   return 60; if (c >= 1)   return 40; return 20; }

function computeScores(metrics) {
  const s = {
    leadTime:     scoreLeadTime(metrics.leadTime),
    cycleTime:    scoreCycleTime(metrics.cycleTime),
    bugRate:      scoreBugRate(metrics.bugRate),
    deployFreq:   scoreDeployFreq(metrics.deployFreq),
    prThroughput: scorePRThroughput(metrics.prThroughput),
  };
  s.overall = Math.round((s.leadTime + s.cycleTime + s.bugRate + s.deployFreq + s.prThroughput) / 5);
  return s;
}

// ── Interpretation engine ─────────────────────────────────────────────────────
function interpretMetrics(metrics) {
  const interp = {};

  // Lead Time
  if (metrics.leadTime <= 24)
    interp.leadTime = { status: 'excellent', label: 'Excellent', story: 'Your changes reach production within a day. This signals a healthy automated pipeline with minimal review bottlenecks.' };
  else if (metrics.leadTime <= 48)
    interp.leadTime = { status: 'good', label: 'Good', story: 'Lead time is within 2 days — solid delivery pace. Small improvements in review turnaround could push this to excellent.' };
  else if (metrics.leadTime <= 72)
    interp.leadTime = { status: 'fair', label: 'Fair', story: 'Changes take 2–3 days to reach production. Review wait times or CI/CD pipeline steps may be adding friction.' };
  else
    interp.leadTime = { status: 'poor', label: 'Needs Attention', story: 'Lead time exceeds 3 days. Look for review bottlenecks, long-running test suites, or manual deployment gates slowing delivery.' };

  // Cycle Time
  if (metrics.cycleTime <= 4)
    interp.cycleTime = { status: 'excellent', label: 'Excellent', story: 'Tasks move from In Progress to Done swiftly. You are breaking work into small, ship-ready chunks — great discipline.' };
  else if (metrics.cycleTime <= 6)
    interp.cycleTime = { status: 'good', label: 'Good', story: 'Cycle time is healthy. Slightly finer-grained tickets could reduce it further and keep momentum visible.' };
  else if (metrics.cycleTime <= 9)
    interp.cycleTime = { status: 'fair', label: 'Fair', story: 'Tasks spend 7–9 days in progress. This can signal unclear requirements, large ticket scope, or external blockers.' };
  else
    interp.cycleTime = { status: 'poor', label: 'Needs Attention', story: 'Long cycle times (>9 days) often mean tickets are too large, there are hidden dependencies, or progress is blocked externally.' };

  // Bug Rate
  if (metrics.bugRate <= 0.1)
    interp.bugRate = { status: 'excellent', label: 'Excellent', story: 'Very few bugs escaping to production. Strong testing habits, careful reviews, and reliable CI gates are working well.' };
  else if (metrics.bugRate <= 0.2)
    interp.bugRate = { status: 'good', label: 'Good', story: 'Bug rate is low. Consider adding property-based or integration tests in areas where bugs tend to cluster.' };
  else if (metrics.bugRate <= 0.35)
    interp.bugRate = { status: 'fair', label: 'Fair', story: 'About 1 in 3 completed items generates a production bug. Review coverage for edge cases and explore pre-merge staging checks.' };
  else
    interp.bugRate = { status: 'poor', label: 'Needs Attention', story: 'High bug escape rate suggests gaps in test coverage, rushed reviews, or missing staging validation. Prioritise test-first practices.' };

  // Deploy Frequency
  if (metrics.deployFreq >= 8)
    interp.deployFreq = { status: 'excellent', label: 'Excellent', story: 'Deploying multiple times a week. You are operating at elite delivery cadence with strong automation.' };
  else if (metrics.deployFreq >= 5)
    interp.deployFreq = { status: 'good', label: 'Good', story: 'Good deployment frequency — roughly once a week. More frequent merges could reduce batch size and deployment risk.' };
  else if (metrics.deployFreq >= 3)
    interp.deployFreq = { status: 'fair', label: 'Fair', story: 'Deploying 3–4× a month. Consider breaking larger features into smaller releases to ship more often with less risk.' };
  else
    interp.deployFreq = { status: 'poor', label: 'Needs Attention', story: 'Low deployment frequency signals large batched changes, lack of feature flags, or manual approval gates.' };

  // PR Throughput
  if (metrics.prThroughput >= 8)
    interp.prThroughput = { status: 'excellent', label: 'Excellent', story: 'High PR throughput shows effective breakdown of work and fast review cycles — a hallmark of high-performing developers.' };
  else if (metrics.prThroughput >= 5)
    interp.prThroughput = { status: 'good', label: 'Good', story: 'Solid PR throughput. Aim to keep PRs small and focused to maintain this pace and improve review quality.' };
  else if (metrics.prThroughput >= 3)
    interp.prThroughput = { status: 'fair', label: 'Fair', story: '3–4 merged PRs per month. Splitting large PRs into smaller logical units can speed up reviews and reduce integration risk.' };
  else
    interp.prThroughput = { status: 'poor', label: 'Needs Attention', story: 'Very few PRs merged. Look at whether PRs are sitting in review for long, or if work is being batched into very large chunks.' };

  return interp;
}

// ── Next Steps generator ──────────────────────────────────────────────────────
function generateNextSteps(metrics, scores) {
  const actionMap = {
    leadTime: [
      { title: 'Audit your CI/CD pipeline', detail: 'Find and eliminate slow test suites or manual gates. Aim to get total pipeline duration under 15 minutes.', priority: 'High', effort: 'Medium', impact: 'High' },
      { title: 'Set a PR review SLA', detail: 'Work with your team to agree on a 4-hour first-review target. Faster reviews directly cut lead time.', priority: 'High', effort: 'Low', impact: 'High' },
    ],
    cycleTime: [
      { title: 'Break tickets into <3-day tasks', detail: 'If a ticket takes more than 3 days, split it. Smaller work units stay unblocked and finish faster.', priority: 'High', effort: 'Low', impact: 'High' },
      { title: 'Daily blocker check-in', detail: 'Flag blockers in standup the moment they appear. Hidden blockers are the #1 cause of long cycle times.', priority: 'Medium', effort: 'Low', impact: 'Medium' },
    ],
    bugRate: [
      { title: 'Add tests before merging', detail: 'Write at least one integration and one edge-case unit test per PR. This directly reduces escaped bugs.', priority: 'High', effort: 'Medium', impact: 'High' },
      { title: 'Review staging environment coverage', detail: 'Ensure staging mirrors production data shapes. Bugs often escape because staging misses edge conditions.', priority: 'High', effort: 'Medium', impact: 'High' },
    ],
    deployFreq: [
      { title: 'Use feature flags to ship smaller', detail: 'Wrap in-progress features in feature flags so you can deploy daily without exposing incomplete work.', priority: 'Medium', effort: 'Medium', impact: 'High' },
      { title: 'Reduce PR size to 1 logical change', detail: 'Smaller PRs get reviewed faster and deploy more frequently. Aim for ≤400 lines changed per PR.', priority: 'Medium', effort: 'Low', impact: 'Medium' },
    ],
    prThroughput: [
      { title: 'Open draft PRs early', detail: 'Open a draft PR as soon as you start a feature. This gives reviewers early context and reduces review time later.', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      { title: 'Timebox review wait time', detail: 'If a PR is not reviewed within 24 hours, proactively ping reviewers. Do not let PRs sit idle.', priority: 'High', effort: 'Low', impact: 'Medium' },
    ],
  };

  // Rank metrics by score ascending (weakest first) and pick top 2
  const ranked = Object.entries(scores)
    .filter(([k]) => k !== 'overall')
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);

  const steps = [];
  ranked.forEach(([key]) => {
    const actions = actionMap[key] || [];
    actions.forEach(a => {
      if (steps.length < 3) steps.push({ ...a, metric: key });
    });
  });

  return steps.slice(0, 3);
}

module.exports = { computeMetrics, computeScores, interpretMetrics, generateNextSteps };
