const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export { API_URL };