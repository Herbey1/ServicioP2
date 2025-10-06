const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function apiFetch(path, { method = 'GET', headers = {}, body, token } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
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
