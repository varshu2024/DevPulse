import React from 'react';

function scoreClass(score) {
  if (score >= 80) return 'sp-green';
  if (score >= 60) return 'sp-blue';
  if (score >= 40) return 'sp-yellow';
  return 'sp-red';
}

function valClass(score) {
  if (score >= 80) return 'c-green';
  if (score >= 60) return 'c-blue';
  if (score >= 40) return 'c-yellow';
  return 'c-red';
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6,7].map(i => (
        <td key={i}><div className="skeleton" style={{ height: 14 }} /></td>
      ))}
    </tr>
  );
}

function ManagerSummary({ teamData = [], loading = false }) {
  return (
    <div className="manager-section">
      <div className="section-title">Team Overview — March 2025</div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Developer</th>
              <th>Lead Time</th>
              <th>Cycle Time</th>
              <th>Bug Rate</th>
              <th>Deploy Freq</th>
              <th>PR Throughput</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3].map(i => <SkeletonRow key={i} />)
              : teamData.map(({ developer: dev, metrics, scores }) => (
                  <tr key={dev.id}>
                    <td>
                      <div className="dev-cell">
                        <div className="dev-initial" style={{ background: dev.avatarColor }}>
                          {dev.avatar}
                        </div>
                        <div>
                          <div className="dev-cell-name">{dev.name}</div>
                          <div className="dev-cell-role">{dev.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className={valClass(scores.leadTime)}>{metrics.leadTime} hrs</td>
                    <td className={valClass(scores.cycleTime)}>{metrics.cycleTime} days</td>
                    <td className={valClass(scores.bugRate)}>{metrics.bugRate}×</td>
                    <td className={valClass(scores.deployFreq)}>{metrics.deployFreq}/mo</td>
                    <td className={valClass(scores.prThroughput)}>{metrics.prThroughput}/mo</td>
                    <td>
                      <span className={`score-pill ${scoreClass(scores.overall)}`}>
                        {scores.overall}/100
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {!loading && teamData.length > 0 && (
        <div className="insight-card">
          <div className="insight-title">Manager Notes</div>
          <div className="insight-text">
            {teamData.map(({ developer: d, scores: s }, i) => {
              const note =
                s.overall >= 80
                  ? `is performing well across all metrics.`
                  : s.overall >= 60
                  ? `is doing reasonably well — cycle time or bug rate could use attention.`
                  : `needs support. Long cycle time and high bug rate suggest blockers or coverage gaps.`;
              return (
                <span key={d.id}>
                  {i > 0 && ' '}
                  <strong>{d.name}</strong> {note}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerSummary;
