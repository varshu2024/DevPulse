/**
 * api.js — All fetch calls to the DevPulse Express backend
 *
 * CRA proxy (package.json "proxy": "http://localhost:3001") means
 * we can use relative paths like /api/... during development.
 */

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';


async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

/** GET /api/developers */
export const fetchDevelopers = () => apiFetch('/developers');

/** GET /api/developers/:id */
export const fetchDeveloper = (id) => apiFetch(`/developers/${id}`);

/**
 * GET /api/metrics/:devId
 * Returns { developer, period, metrics, scores, interpretations, nextSteps }
 */
export const fetchMetrics = (devId) => apiFetch(`/metrics/${devId}`);

/** GET /api/trends/:devId */
export const fetchTrends = (devId) => apiFetch(`/trends/${devId}`);

/** GET /api/team/summary */
export const fetchTeamSummary = () => apiFetch('/team/summary');
