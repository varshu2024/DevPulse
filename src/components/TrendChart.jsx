import React, { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const METRICS = [
  { key: 'leadTime',     label: 'Lead Time (hrs)',    color: '#4338ca' },
  { key: 'cycleTime',    label: 'Cycle Time (days)',   color: '#7c3aed' },
  { key: 'bugRate',      label: 'Bug Rate',            color: '#dc2626' },
  { key: 'deployFreq',   label: 'Deploy Freq',         color: '#059669' },
  { key: 'prThroughput', label: 'PR Throughput',       color: '#d97706' },
];

function radarPoints(scores) {
  return [
    { metric: 'Lead Time',    score: scores.leadTime    || 0 },
    { metric: 'Cycle Time',   score: scores.cycleTime   || 0 },
    { metric: 'Bug Rate',     score: scores.bugRate     || 0 },
    { metric: 'Deploy Freq',  score: scores.deployFreq  || 0 },
    { metric: 'PR Throughput', score: scores.prThroughput || 0 },
  ];
}

const SimpleTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 6, padding: '8px 12px', fontSize: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: <span style={{ color: '#1a1d23' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function TrendChart({ trendData = [], scores = {} }) {
  const [chartType,    setChartType]    = useState('line');
  const [activeMetric, setActiveMetric] = useState('leadTime');

  const activeMeta = METRICS.find(m => m.key === activeMetric);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">6-Month Trend</div>
          <div className="chart-sub">How metrics changed over time</div>
        </div>
        <div className="chart-tabs">
          {['line', 'bar', 'radar'].map(t => (
            <button
              key={t}
              className={`chart-tab ${chartType === t ? 'active' : ''}`}
              onClick={() => setChartType(t)}
            >
              {t === 'line' ? 'Line' : t === 'bar' ? 'Bar' : 'Radar'}
            </button>
          ))}
        </div>
      </div>

      {chartType !== 'radar' && (
        <div className="metric-tabs">
          {METRICS.map(m => (
            <button
              key={m.key}
              className={`metric-tab ${activeMetric === m.key ? 'active' : ''}`}
              onClick={() => setActiveMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        {chartType === 'line' ? (
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleTooltip />} />
            <Line
              type="monotone"
              dataKey={activeMetric}
              name={activeMeta?.label}
              stroke={activeMeta?.color || '#4338ca'}
              strokeWidth={2}
              dot={{ fill: activeMeta?.color || '#4338ca', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleTooltip />} />
            <Bar dataKey={activeMetric} name={activeMeta?.label} fill={activeMeta?.color || '#4338ca'} radius={[3,3,0,0]} />
          </BarChart>
        ) : (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarPoints(scores)}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Score" dataKey="score" stroke="#4338ca" fill="#4338ca" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
