const DEFAULT_PORT = "4000";

function resolveApiBase(raw) {
  const hasWindow = typeof window !== "undefined";
  const currentHost = hasWindow ? window.location.hostname : "localhost";
  const currentProtocol = hasWindow ? window.location.protocol : "http:";

  if (!raw) {
    return `${currentProtocol}//${currentHost}:${DEFAULT_PORT}`;
  }

  try {
    const url = new URL(raw);
    const needsHostSwap = ["backend", "localhost", "127.0.0.1"].includes(url.hostname);
    if (hasWindow && needsHostSwap && url.hostname !== currentHost) {
      url.hostname = currentHost;
    }
    if (!url.port && (needsHostSwap || url.hostname === currentHost)) {
      url.port = DEFAULT_PORT;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    // Si la URL no es válida, regresamos el fallback
    return `${currentProtocol}//${currentHost}:${DEFAULT_PORT}`;
  }
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_URL);

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

  const url = new URL(path, `${API_BASE}/`);
  const res = await fetch(url.toString(), opts);
  const data = await res.json().catch(() => ({})); // por si la respuesta no es JSON

  const payload = { ok: res.ok, status: res.status, data };
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (payload[key] === undefined) {
        payload[key] = value;
      }
    }
  }

  return payload;
}

export { API_BASE as API_URL };
