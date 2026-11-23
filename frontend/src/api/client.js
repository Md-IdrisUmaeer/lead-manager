// Single place that talks to the backend. Every failure becomes an ApiError,
// so components only ever deal with one error shape.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const TIMEOUT_MS = 10000;
const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = network failure / timeout
    this.details = details; // { field: message } for validation errors
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  // Our own controller handles the timeout; an external signal (e.g. a newer
  // request replacing this one) aborts it too.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      // Only send Content-Type with a body: on GET it would trigger a CORS preflight.
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    // Cancelled by the caller: rethrow the AbortError so it can be ignored.
    if (signal?.aborted) throw err;
    throw new ApiError(0, NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON body (e.g. a proxy error page): data stays null
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`, data?.details);
  }
  return data;
}

export function isAbortError(err) {
  return err?.name === 'AbortError';
}
