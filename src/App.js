import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

import { fetchDevelopers, fetchMetrics, fetchTrends, fetchTeamSummary } from './api/api';
import MetricCard          from './components/MetricCard';
import InterpretationPanel from './components/InterpretationPanel';
import TrendChart          from './components/TrendChart';
import NextSteps           from './components/NextSteps';
import ManagerSummary      from './components/ManagerSummary';

const METRIC_KEYS = ['leadTime', 'cycleTime', 'bugRate', 'deployFreq', 'prThroughput'];

// simple skeleton block
function Skel({ w = '100%', h = 16, r = 4 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

function App() {
  const [developers,    setDevelopers]    = useState([]);
  const [selectedId,    setSelectedId]    = useState(null);
  const [view,          setView]          = useState('ic');      // 'ic' or 'manager'
  const [activeMetric,  setActiveMetric]  = useState('leadTime');

  const [metricsData,   setMetricsData]   = useState(null);
  const [trendData,     setTrendData]     = useState([]);
  const [teamData,      setTeamData]      = useState([]);

  const [loadingDevs,   setLoadingDevs]   = useState(true);
  const [loadingData,   setLoadingData]   = useState(false);
  const [loadingTeam,   setLoadingTeam]   = useState(false);
  const [error,         setError]         = useState(null);

  // fetch developer list on first load
  useEffect(() => {
    fetchDevelopers()
      .then(data => {
        setDevelopers(data);
        setSelectedId(data[0]?.id || null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingDevs(false));
  }, []);

  // fetch metrics + trends when developer changes
  const loadDeveloperData = useCallback(() => {
    if (!selectedId) return;
    setLoadingData(true);
    setError(null);
    Promise.all([fetchMetrics(selectedId), fetchTrends(selectedId)])
      .then(([mData, tData]) => {
        setMetricsData(mData);
        setTrendData(tData);
        setActiveMetric('leadTime');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingData(false));
  }, [selectedId]);

  useEffect(() => { loadDeveloperData(); }, [loadDeveloperData]);

  // fetch team data when manager view is opened
  useEffect(() => {
    if (view !== 'manager' || teamData.length > 0) return;
    setLoadingTeam(true);
    fetchTeamSummary()
      .then(data => setTeamData(data))
      .catch(e => setError(e.message))
      .finally(() => setLoadingTeam(false));
  }, [view, teamData.length]);

  const handleDevSelect = (id) => {
    setSelectedId(id);
    setView('ic');
  };

  const handleMetricClick = (key) => {
    setActiveMetric(key);
    document.getElementById('interp-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const healthColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#2563eb';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  const dev             = metricsData?.developer;
  const metrics         = metricsData?.metrics         || {};
  const scores          = metricsData?.scores          || {};
  const interpretations = metricsData?.interpretations || {};
  const nextSteps       = metricsData?.nextSteps       || [];

  return (
    <div className="app">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">DevPulse</div>
          <div className="logo-sub">Developer Productivity</div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Developers</div>

          {loadingDevs
            ? [1,2,3].map(i => (
                <div key={i} style={{ padding: '8px 10px' }}>
                  <Skel h={28} r={6} />
                </div>
              ))
            : developers.map(d => (
                <button
                  key={d.id}
                  className={`sidebar-btn ${selectedId === d.id && view === 'ic' ? 'active' : ''}`}
                  onClick={() => handleDevSelect(d.id)}
                >
                  <div className="dev-initial" style={{ background: d.avatarColor }}>
                    {d.avatar}
                  </div>
                  <div>
                    <div>{d.name}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{d.team}</div>
                  </div>
                </button>
              ))
          }
        </div>

        <div className="sidebar-footer">
          <div
            className={`sidebar-footer-btn ${view === 'manager' ? 'active' : ''}`}
            onClick={() => setView('manager')}
          >
            <span>👔</span>
            <span>Manager View</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="main">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">
              {view === 'ic'
                ? (dev ? `${dev.name}'s Dashboard` : 'Loading...')
                : 'Manager Overview'}
            </div>
            <div className="topbar-sub">
              {view === 'ic' ? (dev?.role || '') : 'Team metrics at a glance'}
            </div>
          </div>
          <div className="topbar-right">
            <div className="view-switch">
              <button className={`vsw-btn ${view === 'ic' ? 'active' : ''}`} onClick={() => setView('ic')}>
                IC View
              </button>
              <button className={`vsw-btn ${view === 'manager' ? 'active' : ''}`} onClick={() => setView('manager')}>
                Manager
              </button>
            </div>
            <div className="period-badge">March 2025</div>
          </div>
        </div>

        {/* Page */}
        <div className="page">

          {error && (
            <div className="error-bar">
              <span>Something went wrong: {error}</span>
              <button className="retry-btn" onClick={loadDeveloperData}>Retry</button>
            </div>
          )}

          {view === 'manager' ? (
            <ManagerSummary teamData={teamData} loading={loadingTeam} />
          ) : (
            <>
              {/* Profile card */}
              <div className="profile-card">
                <div className="profile-left">
                  {loadingData || !dev ? (
                    <>
                      <Skel w={52} h={52} r={10} />
                      <div>
                        <Skel w={160} h={18} r={4} />
                        <div style={{ marginTop: 6 }}><Skel w={110} h={12} r={4} /></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="dev-avatar" style={{ background: dev.avatarColor }}>
                        {dev.avatar}
                      </div>
                      <div>
                        <div className="dev-name">{dev.name}</div>
                        <div className="dev-role">{dev.role}</div>
                        <div className="dev-team">{dev.team} Team</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="health-score-wrap">
                  <div className="health-label">Health Score</div>
                  {loadingData ? (
                    <Skel w={70} h={42} r={6} />
                  ) : (
                    <>
                      <div className="health-score" style={{ color: healthColor(scores.overall || 0) }}>
                        {scores.overall ?? '—'}
                      </div>
                      <div className="health-max">out of 100</div>
                    </>
                  )}
                </div>
              </div>

              {/* 5 metrics */}
              <div className="section-title">5 Key Metrics — click any to see interpretation</div>
              <div className="metrics-grid">
                {METRIC_KEYS.map(key => (
                  <MetricCard
                    key={key}
                    metricKey={key}
                    value={loadingData ? '—' : (metrics[key] ?? '—')}
                    score={scores[key] || 0}
                    interpretation={interpretations[key]}
                    selected={activeMetric === key}
                    onClick={handleMetricClick}
                  />
                ))}
              </div>

              {/* Interpretation */}
              <div id="interp-section">
                <div className="section-title">What this metric means for you</div>
                {!loadingData && (
                  <InterpretationPanel
                    activeMetric={activeMetric}
                    interpretation={interpretations[activeMetric]}
                  />
                )}
              </div>

              {/* Trend + Next steps */}
              <div className="two-col">
                <div>
                  <div className="section-title">6-Month Trend</div>
                  <TrendChart trendData={trendData} scores={scores} />
                </div>
                <div>
                  <div className="section-title">Suggested Next Steps</div>
                  <NextSteps steps={nextSteps} loading={loadingData} />
                </div>
              </div>

              {/* Data note */}
              <div className="data-note">
                Data served by Express API at{' '}
                <a href="http://localhost:3001/api/health" target="_blank" rel="noreferrer">
                  localhost:3001/api
                </a>.
                Source tables: issues (cycle time) · pull requests (lead time, PR throughput) ·
                deployments (deploy frequency) · bug reports (bug rate). Period: March 2025.
              </div>
            </>
          )}

        </div>
      </main>

    </div>
  );
}

export default App;
