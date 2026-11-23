import { request } from './client';

export function listLeads(params = {}, signal) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  }
  const query = qs.toString();
  return request(`/leads${query ? `?${query}` : ''}`, { signal });
}

export function getStats(signal) {
  return request('/leads/stats', { signal });
}

export function createLead(data) {
  return request('/leads', { method: 'POST', body: data });
}

export function updateLead(id, data) {
  return request(`/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: data });
}

export function deleteLead(id) {
  return request(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
