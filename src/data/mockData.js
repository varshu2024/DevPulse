
// ─────────────────────────────────────────────
// Mock data — mimics the workbook's source tables
// ─────────────────────────────────────────────

export const developers = [
  {
    id: "dev-001",
    name: "Arjun Mehta",
    role: "Senior Software Engineer",
    team: "Platform",
    avatar: "AM",
    avatarColor: "#6366f1",
    joinDate: "2022-03-14",
  },
  {
    id: "dev-002",
    name: "Priya Sharma",
    role: "Software Engineer II",
    team: "Frontend",
    avatar: "PS",
    avatarColor: "#ec4899",
    joinDate: "2023-01-09",
  },
  {
    id: "dev-003",
    name: "Rohan Das",
    role: "Software Engineer",
    team: "Backend",
    avatar: "RD",
    avatarColor: "#10b981",
    joinDate: "2023-07-21",
  },
];

// Jira-like issues
export const issues = [
  { id: "PROJ-101", dev: "dev-001", title: "API rate limiter", status: "Done", inProgressAt: "2025-03-01", doneAt: "2025-03-05" },
  { id: "PROJ-102", dev: "dev-001", title: "Redis cache integration", status: "Done", inProgressAt: "2025-03-06", doneAt: "2025-03-12" },
  { id: "PROJ-103", dev: "dev-001", title: "Auth token refresh", status: "Done", inProgressAt: "2025-03-13", doneAt: "2025-03-18" },
  { id: "PROJ-104", dev: "dev-001", title: "Metrics endpoint", status: "Done", inProgressAt: "2025-03-19", doneAt: "2025-03-22" },
  { id: "PROJ-105", dev: "dev-001", title: "Batch job scheduler", status: "Done", inProgressAt: "2025-03-23", doneAt: "2025-03-31" },

  { id: "PROJ-201", dev: "dev-002", title: "Dashboard redesign", status: "Done", inProgressAt: "2025-03-01", doneAt: "2025-03-10" },
  { id: "PROJ-202", dev: "dev-002", title: "Component library v2", status: "Done", inProgressAt: "2025-03-11", doneAt: "2025-03-20" },
  { id: "PROJ-203", dev: "dev-002", title: "Dark mode support", status: "Done", inProgressAt: "2025-03-21", doneAt: "2025-03-27" },

  { id: "PROJ-301", dev: "dev-003", title: "DB migration script", status: "Done", inProgressAt: "2025-03-02", doneAt: "2025-03-08" },
  { id: "PROJ-302", dev: "dev-003", title: "gRPC service layer", status: "Done", inProgressAt: "2025-03-09", doneAt: "2025-03-22" },
];

// Pull Requests
export const pullRequests = [
  { id: "PR-501", dev: "dev-001", title: "feat: rate limiter", openedAt: "2025-03-01T10:00:00Z", mergedAt: "2025-03-02T14:00:00Z", deployedAt: "2025-03-02T17:00:00Z", status: "merged" },
  { id: "PR-502", dev: "dev-001", title: "feat: redis cache", openedAt: "2025-03-06T09:00:00Z", mergedAt: "2025-03-08T11:00:00Z", deployedAt: "2025-03-08T15:00:00Z", status: "merged" },
  { id: "PR-503", dev: "dev-001", title: "feat: auth refresh", openedAt: "2025-03-13T08:00:00Z", mergedAt: "2025-03-15T10:00:00Z", deployedAt: "2025-03-15T13:00:00Z", status: "merged" },
  { id: "PR-504", dev: "dev-001", title: "feat: metrics endpoint", openedAt: "2025-03-19T11:00:00Z", mergedAt: "2025-03-20T16:00:00Z", deployedAt: "2025-03-20T18:00:00Z", status: "merged" },
  { id: "PR-505", dev: "dev-001", title: "feat: batch scheduler", openedAt: "2025-03-24T09:00:00Z", mergedAt: "2025-03-26T12:00:00Z", deployedAt: "2025-03-26T15:00:00Z", status: "merged" },
  { id: "PR-506", dev: "dev-001", title: "fix: scheduler edge case", openedAt: "2025-03-27T14:00:00Z", mergedAt: "2025-03-29T10:00:00Z", deployedAt: "2025-03-29T14:00:00Z", status: "merged" },

  { id: "PR-601", dev: "dev-002", title: "feat: dashboard redesign", openedAt: "2025-03-01T09:00:00Z", mergedAt: "2025-03-05T14:00:00Z", deployedAt: "2025-03-05T17:00:00Z", status: "merged" },
  { id: "PR-602", dev: "dev-002", title: "feat: component library", openedAt: "2025-03-11T10:00:00Z", mergedAt: "2025-03-18T16:00:00Z", deployedAt: "2025-03-18T18:30:00Z", status: "merged" },
  { id: "PR-603", dev: "dev-002", title: "feat: dark mode", openedAt: "2025-03-21T09:00:00Z", mergedAt: "2025-03-25T11:00:00Z", deployedAt: "2025-03-25T14:00:00Z", status: "merged" },

  { id: "PR-701", dev: "dev-003", title: "feat: db migration", openedAt: "2025-03-02T10:00:00Z", mergedAt: "2025-03-06T09:00:00Z", deployedAt: "2025-03-06T13:00:00Z", status: "merged" },
  { id: "PR-702", dev: "dev-003", title: "feat: grpc layer", openedAt: "2025-03-09T11:00:00Z", mergedAt: "2025-03-20T15:00:00Z", deployedAt: "2025-03-20T17:00:00Z", status: "merged" },
];

// CI/CD Deployments
export const deployments = [
  { id: "D-001", dev: "dev-001", prId: "PR-501", deployedAt: "2025-03-02T17:00:00Z", env: "production", status: "success" },
  { id: "D-002", dev: "dev-001", prId: "PR-502", deployedAt: "2025-03-08T15:00:00Z", env: "production", status: "success" },
  { id: "D-003", dev: "dev-001", prId: "PR-503", deployedAt: "2025-03-15T13:00:00Z", env: "production", status: "success" },
  { id: "D-004", dev: "dev-001", prId: "PR-504", deployedAt: "2025-03-20T18:00:00Z", env: "production", status: "success" },
  { id: "D-005", dev: "dev-001", prId: "PR-505", deployedAt: "2025-03-26T15:00:00Z", env: "production", status: "success" },
  { id: "D-006", dev: "dev-001", prId: "PR-506", deployedAt: "2025-03-29T14:00:00Z", env: "production", status: "success" },

  { id: "D-101", dev: "dev-002", prId: "PR-601", deployedAt: "2025-03-05T17:00:00Z", env: "production", status: "success" },
  { id: "D-102", dev: "dev-002", prId: "PR-602", deployedAt: "2025-03-18T18:30:00Z", env: "production", status: "success" },
  { id: "D-103", dev: "dev-002", prId: "PR-603", deployedAt: "2025-03-25T14:00:00Z", env: "production", status: "success" },

  { id: "D-201", dev: "dev-003", prId: "PR-701", deployedAt: "2025-03-06T13:00:00Z", env: "production", status: "success" },
  { id: "D-202", dev: "dev-003", prId: "PR-702", deployedAt: "2025-03-20T17:00:00Z", env: "production", status: "success" },
];

// Production Bugs
export const bugs = [
  { id: "BUG-001", dev: "dev-001", reportedAt: "2025-03-10", relatedPr: "PR-502", severity: "medium" },
  { id: "BUG-002", dev: "dev-001", reportedAt: "2025-03-28", relatedPr: "PR-505", severity: "low" },

  { id: "BUG-101", dev: "dev-002", reportedAt: "2025-03-12", relatedPr: "PR-601", severity: "high" },

  { id: "BUG-201", dev: "dev-003", reportedAt: "2025-03-24", relatedPr: "PR-702", severity: "high" },
  { id: "BUG-202", dev: "dev-003", reportedAt: "2025-03-28", relatedPr: "PR-702", severity: "medium" },
];

// 6-month trend data per developer
export const trendData = {
  "dev-001": [
    { month: "Oct", leadTime: 4.2, cycleTime: 8.1, bugRate: 0.4, deploys: 3, prThroughput: 4 },
    { month: "Nov", leadTime: 3.8, cycleTime: 7.5, bugRate: 0.3, deploys: 4, prThroughput: 5 },
    { month: "Dec", leadTime: 3.5, cycleTime: 6.9, bugRate: 0.25, deploys: 5, prThroughput: 5 },
    { month: "Jan", leadTime: 3.2, cycleTime: 6.5, bugRate: 0.2, deploys: 5, prThroughput: 6 },
    { month: "Feb", leadTime: 3.0, cycleTime: 7.1, bugRate: 0.3, deploys: 4, prThroughput: 5 },
    { month: "Mar", leadTime: 2.2, cycleTime: 6.2, bugRate: 0.33, deploys: 6, prThroughput: 6 },
  ],
  "dev-002": [
    { month: "Oct", leadTime: 5.5, cycleTime: 9.2, bugRate: 0.5, deploys: 2, prThroughput: 3 },
    { month: "Nov", leadTime: 5.1, cycleTime: 9.0, bugRate: 0.4, deploys: 2, prThroughput: 3 },
    { month: "Dec", leadTime: 5.8, cycleTime: 10.1, bugRate: 0.5, deploys: 2, prThroughput: 2 },
    { month: "Jan", leadTime: 6.2, cycleTime: 10.8, bugRate: 0.6, deploys: 1, prThroughput: 2 },
    { month: "Feb", leadTime: 5.9, cycleTime: 10.5, bugRate: 0.5, deploys: 2, prThroughput: 3 },
    { month: "Mar", leadTime: 5.3, cycleTime: 9.8, bugRate: 0.33, deploys: 3, prThroughput: 3 },
  ],
  "dev-003": [
    { month: "Oct", leadTime: 6.0, cycleTime: 11.0, bugRate: 0.6, deploys: 2, prThroughput: 2 },
    { month: "Nov", leadTime: 7.1, cycleTime: 12.5, bugRate: 0.7, deploys: 1, prThroughput: 2 },
    { month: "Dec", leadTime: 8.5, cycleTime: 14.0, bugRate: 0.8, deploys: 1, prThroughput: 1 },
    { month: "Jan", leadTime: 9.2, cycleTime: 15.1, bugRate: 0.9, deploys: 1, prThroughput: 1 },
    { month: "Feb", leadTime: 8.8, cycleTime: 14.5, bugRate: 0.85, deploys: 1, prThroughput: 2 },
    { month: "Mar", leadTime: 8.0, cycleTime: 13.5, bugRate: 1.0, deploys: 2, prThroughput: 2 },
  ],
};
