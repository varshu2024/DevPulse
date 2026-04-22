/**
 * DevPulse — Express API Server  (port 3001)
 *
 * Routes:
 *   GET /api/health                  → server health check
 *   GET /api/developers              → list all developers
 *   GET /api/developers/:id          → single developer profile
 *   GET /api/metrics/:devId          → computed metrics + scores + interpretation + next steps
 *   GET /api/trends/:devId           → 6-month historical trend data
 *   GET /api/team/summary            → all developers with metrics (manager view)
 *   GET /api/raw/:table              → raw source table for transparency
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { computeMetrics, computeScores, interpretMetrics, generateNextSteps } = require('./metricsEngine');

// ── Load source tables (JSON files act as our data store) ─────────────────────
const developers  = require('./data/developers.json');
const issues      = require('./data/issues.json');
const pullRequests = require('./data/pullRequests.json');
const deployments = require('./data/deployments.json');
const bugs        = require('./data/bugs.json');
const trends      = require('./data/trends.json');

const db = { issues, pullRequests, deployments, bugs };

// ── App setup ─────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Request logger middleware ─────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

/** Health check */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

/** List all developers */
app.get('/api/developers', (_req, res) => {
  res.json({ success: true, data: developers });
});

/** Single developer profile */
app.get('/api/developers/:id', (req, res) => {
  const dev = developers.find(d => d.id === req.params.id);
  if (!dev) return res.status(404).json({ success: false, error: 'Developer not found' });
  res.json({ success: true, data: dev });
});

/**
 * Computed metrics for one developer
 * Returns: metrics (raw values), scores (0-100), interpretations, nextSteps
 */
app.get('/api/metrics/:devId', (req, res) => {
  const { devId } = req.params;

  const dev = developers.find(d => d.id === devId);
  if (!dev) return res.status(404).json({ success: false, error: 'Developer not found' });

  const metrics        = computeMetrics(devId, db);
  const scores         = computeScores(metrics);
  const interpretations = interpretMetrics(metrics);
  const nextSteps      = generateNextSteps(metrics, scores);

  res.json({
    success: true,
    data: {
      developer:      dev,
      period:         'March 2025',
      metrics,
      scores,
      interpretations,
      nextSteps,
    },
  });
});

/** 6-month trend data for one developer */
app.get('/api/trends/:devId', (req, res) => {
  const { devId } = req.params;
  const devTrend = trends[devId];
  if (!devTrend) return res.status(404).json({ success: false, error: 'Trend data not found' });
  res.json({ success: true, data: devTrend });
});

/**
 * Manager summary — all developers with their metrics
 */
app.get('/api/team/summary', (_req, res) => {
  const summary = developers.map(dev => {
    const metrics  = computeMetrics(dev.id, db);
    const scores   = computeScores(metrics);
    return { developer: dev, metrics, scores };
  });
  res.json({ success: true, data: summary });
});

/**
 * Raw source table — for transparency and debugging
 * Allowed tables: developers, issues, pullRequests, deployments, bugs
 */
app.get('/api/raw/:table', (req, res) => {
  const allowed = { developers, issues, pullRequests, deployments, bugs };
  const table   = allowed[req.params.table];
  if (!table) {
    return res.status(404).json({
      success: false,
      error: `Table not found. Available: ${Object.keys(allowed).join(', ')}`,
    });
  }
  res.json({ success: true, table: req.params.table, data: table });
});

/** 404 fallback */
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  DevPulse API running at http://localhost:${PORT}`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/developers`);
  console.log(`   GET /api/metrics/:devId`);
  console.log(`   GET /api/trends/:devId`);
  console.log(`   GET /api/team/summary`);
  console.log(`   GET /api/raw/:table\n`);
});
