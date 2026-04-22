import React from 'react';

const METRIC_LABELS = {
  leadTime: 'Lead Time', cycleTime: 'Cycle Time',
  bugRate: 'Bug Rate', deployFreq: 'Deploy Freq', prThroughput: 'PR Throughput',
};

function NextSteps({ steps = [], loading = false }) {
  if (loading) {
    return (
      <div className="steps-card">
        {[1,2,3].map(i => (
          <div key={i} className="step-item">
            <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '90%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!steps.length) {
    return (
      <div className="steps-card" style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
        All metrics look healthy — no urgent actions right now.
      </div>
    );
  }

  return (
    <div className="steps-card">
      {steps.map((step, i) => (
        <div className="step-item" key={i}>
          <div className="step-num">{i + 1}</div>
          <div>
            <div className="step-title">{step.title}</div>
            <div className="step-detail">{step.detail}</div>
            <div className="step-tags">
              <span className="step-tag">Priority: {step.priority}</span>
              <span className="step-tag">Effort: {step.effort}</span>
              <span className="step-tag">Impact: {step.impact}</span>
              <span className="step-tag">Metric: {METRIC_LABELS[step.metric] || step.metric}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NextSteps;
