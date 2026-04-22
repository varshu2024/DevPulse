import React from 'react';

// maps metric key → display info
const META = {
  leadTime:     { name: 'Lead Time',         unit: 'hrs',  icon: '⏱' },
  cycleTime:    { name: 'Cycle Time',         unit: 'days', icon: '🔁' },
  bugRate:      { name: 'Bug Rate',           unit: '×',    icon: '🐛' },
  deployFreq:   { name: 'Deploy Freq',        unit: '/mo',  icon: '🚀' },
  prThroughput: { name: 'PR Throughput',      unit: '/mo',  icon: '🔀' },
};

// pick text color class based on health score
function colorClass(score) {
  if (score >= 80) return 'c-green';
  if (score >= 60) return 'c-blue';
  if (score >= 40) return 'c-yellow';
  return 'c-red';
}

function badgeClass(score) {
  if (score >= 80) return 'badge-green';
  if (score >= 60) return 'badge-blue';
  if (score >= 40) return 'badge-yellow';
  return 'badge-red';
}

function MetricCard({ metricKey, value, score, interpretation, selected, onClick }) {
  const meta = META[metricKey];
  return (
    <div
      className={`metric-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(metricKey)}
      title="Click to see interpretation"
    >
      <div className="metric-name">{meta.name}</div>
      <div>
        <span className={`metric-val ${colorClass(score)}`}>{value}</span>
        <span className="metric-unit">{meta.unit}</span>
      </div>
      <div className={`metric-badge ${badgeClass(score)}`}>
        {interpretation?.label || '—'}
      </div>
    </div>
  );
}

export default MetricCard;
export { META };
