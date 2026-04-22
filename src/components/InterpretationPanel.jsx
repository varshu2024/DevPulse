import React from 'react';

const METRIC_NAMES = {
  leadTime:     'Lead Time for Changes',
  cycleTime:    'Cycle Time',
  bugRate:      'Bug Rate',
  deployFreq:   'Deployment Frequency',
  prThroughput: 'PR Throughput',
};

const ICONS = {
  leadTime: '⏱', cycleTime: '🔁', bugRate: '🐛',
  deployFreq: '🚀', prThroughput: '🔀',
};

function statusBadge(status) {
  const map = {
    excellent: 'badge-green',
    good:      'badge-blue',
    fair:      'badge-yellow',
    poor:      'badge-red',
  };
  return map[status] || 'badge-blue';
}

function InterpretationPanel({ activeMetric, interpretation }) {
  if (!activeMetric || !interpretation) return null;

  return (
    <div className="interp-card" key={activeMetric}>
      <div className="interp-top">
        <span className="interp-icon">{ICONS[activeMetric]}</span>
        <span className="interp-metric-name">{METRIC_NAMES[activeMetric]}</span>
        <span className={`interp-status metric-badge ${statusBadge(interpretation.status)}`}>
          {interpretation.label}
        </span>
      </div>
      <p className="interp-text">{interpretation.story}</p>
      <p className="interp-tip">💡 Scroll down to see suggested next steps based on your lowest metrics.</p>
    </div>
  );
}

export default InterpretationPanel;
