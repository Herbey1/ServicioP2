// Ensure an empty string VITE_API_URL doesn't produce a relative URL.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (typeof rawApiUrl === 'string' && rawApiUrl.trim().length > 0) ? rawApiUrl.trim() : 'http://localhost:4000';

export async function apiFetch(path, { method = 'GET', headers = {}, body, token } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      opts.body = body;
      // Permit that the browser set the multipart boundary automatically.
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const auth = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  if (auth) {
    opts.headers['Authorization'] = `Bearer ${auth}`;
  }

  const res = await fetch(`${API_URL}${path}`, opts);
  const data = await res.json().catch(() => ({})); // por si la respuesta no es JSON

  return { ok: res.ok, status: res.status, data };
}

export { API_URL };
