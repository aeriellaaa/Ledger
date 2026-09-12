/**
 * api.js — fetch wrapper functions for the Budget Forecaster API.
 *
 * All /api/transactions and /api/forecast routes now require auth —
 * every request sends the stored token as a Bearer header.
 */

const API_BASE = '/api';
let authToken = null;

function setToken(token) {
  authToken = token;
  sessionStorage.setItem('authToken', token);
}

function getToken() {
  if (authToken) return authToken;
  authToken = sessionStorage.getItem('authToken');
  return authToken;
}

function clearToken() {
  authToken = null;
  sessionStorage.removeItem('authToken');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    // no JSON body (e.g. 204 No Content on delete)
  }

  if (!res.ok) {
    const messages = Array.isArray(body?.errors) && body.errors.length
      ? body.errors
      : [body?.error || `Request failed with status ${res.status}`];
    throw new ApiError(messages, res.status);
  }

  return body;
}

class ApiError extends Error {
  constructor(messages, status) {
    super(messages.join(' '));
    this.name = 'ApiError';
    this.messages = messages;
    this.status = status;
  }
}

/* ===== Auth ===== */

async function apiSignup(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/* ===== Transactions (all now require the auth header) ===== */

async function getTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.category) params.set('category', filters.category);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

async function createTransaction(data) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

async function updateTransaction(id, data) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

async function getForecast(months = 6) {
  const res = await fetch(`${API_BASE}/forecast?months=${months}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}