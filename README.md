# DevPulse — Developer Productivity MVP

A focused full-stack MVP that helps individual contributors move from raw productivity metrics to clear interpretation and actionable next steps.


**Live demo:** `npm start` (frontend) + `node server/index.js` (backend)

**Miro User Journey Board:** [View on Miro](https://miro.com/app/board/uXjVHe-Zcgc=/?share_link_id=632067602157)

---

## Deliverables

| Deliverable | Link |
|---|---|
| GitHub Code | [varshu2024/DevPulse](https://github.com/varshu2024/DevPulse) |
| Miro User Journey | [View Board](https://miro.com/app/board/uXjVHe-Zcgc=/?share_link_id=632067602157) |
| Local Frontend | `http://localhost:3000` |
| Local API | `http://localhost:3001/api` |

---


## The Problem

Developers and managers can see metrics like lead time, cycle time, and bug rate — but numbers alone don't explain what's happening or what to do next. DevPulse adds the **interpretation and action layer** on top of raw metrics.

---

## What It Does

- Shows 5 key productivity metrics per developer (Lead Time, Cycle Time, Bug Rate, Deploy Frequency, PR Throughput)
- Click any metric to see a plain-English interpretation of what's likely causing it
- Suggests 2–3 practical next steps based on the weakest metrics
- Shows a 6-month trend chart (line / bar / radar)
- Manager view with full team comparison and auto-generated notes

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Create React App) |
| Backend | Node.js + Express |
| Charts | Recharts |
| Data store | JSON files (source tables) |
| Styling | Vanilla CSS |

---

## Project Structure

```
devpulse/
├── public/                  # HTML template
├── src/
│   ├── api/
│   │   └── api.js           # All fetch calls to the backend
│   ├── components/
│   │   ├── MetricCard.jsx
│   │   ├── InterpretationPanel.jsx
│   │   ├── TrendChart.jsx
│   │   ├── NextSteps.jsx
│   │   └── ManagerSummary.jsx
│   ├── App.js               # Root component
│   └── index.css            # Styles
└── server/
    ├── data/
    │   ├── developers.json  # Developer dimension table
    │   ├── issues.json      # Jira-like issue tracker
    │   ├── pullRequests.json
    │   ├── deployments.json # CI/CD deployment logs
    │   ├── bugs.json        # Post-release bug reports
    │   └── trends.json      # 6-month historical data
    ├── metricsEngine.js     # All metric calculations + interpretations
    └── index.js             # Express server (port 3001)
```

---

## API Endpoints

```
GET /api/health              → server status
GET /api/developers          → list all developers
GET /api/developers/:id      → single developer profile
GET /api/metrics/:devId      → metrics + scores + interpretations + next steps
GET /api/trends/:devId       → 6-month trend data
GET /api/team/summary        → all developers with metrics (manager view)
GET /api/raw/:table          → raw source table data
```

---

## Metric Definitions (from assignment)

| Metric | Formula |
|---|---|
| **Lead Time** | Avg hours from PR opened → successful prod deployment |
| **Cycle Time** | Avg days from issue In-Progress → Done |
| **Bug Rate** | Escaped prod bugs ÷ issues completed in the month |
| **Deploy Frequency** | Count of successful prod deployments in the month |
| **PR Throughput** | Count of merged pull requests in the month |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the backend (port 3001)
node server/index.js

# 3. Start the frontend (port 3000) — in a new terminal
npm start
```

Then open `http://localhost:3000`

---

## Design Decisions

- **Mock data over a live DB** — keeps the data model transparent and easy to explain in interviews. The API layer is production-ready; swapping JSON for a real DB is straightforward.
- **Click-to-interpret pattern** — metrics are only useful when they explain something. The interpretation panel is the core product feature.
- **Next steps from weakest 2 metrics** — focused output beats a long list of suggestions.
- **Manager view kept lightweight** — one focused user journey is stronger than a broad unfinished product.
