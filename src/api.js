// Lightweight client for The Last Signal backend API.
//
// Configure the base URL with a Vite env var if your backend is not on the
// default port: create `.env` in the project root with
//   VITE_API_URL=http://localhost:4000/api
//
// Usage:
//   import { api } from './api';
//   await api.register('OPERATOR-7', 'hunter2');
//   await api.login('OPERATOR-7', 'hunter2');
//   const { leaderboard } = await api.leaderboard();
//   await api.submitRun({ missionId: 'LS-12', wpm: 142, accuracy: 97.4, mistakes: 4, durationSec: 62, keystrokes: 740 });
//   const stats = await api.myStats();

const BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000/api';
const TOKEN_KEY = 'tls_token_v1';
const USER_KEY = 'tls_user_v1';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}
function setSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) { /* ignore */ }
}
function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
}
function clearSession() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  isAuthed() { return !!getToken(); },
  currentUser() { return getUser(); },
  logout() { clearSession(); },

  async register(username, password) {
    const data = await request('/auth/register', { method: 'POST', body: { username, password } });
    setSession(data.token, data.user);
    return data;
  },

  async login(username, password) {
    const data = await request('/auth/login', { method: 'POST', body: { username, password } });
    setSession(data.token, data.user);
    return data;
  },

  me() {
    return request('/auth/me', { auth: true });
  },

  leaderboard(limit = 50) {
    return request(`/leaderboard?limit=${limit}`, { auth: true });
  },

  submitRun(run) {
    return request('/runs', { method: 'POST', body: run, auth: true });
  },

  myStats() {
    return request('/stats/me', { auth: true });
  },
};

export default api;
