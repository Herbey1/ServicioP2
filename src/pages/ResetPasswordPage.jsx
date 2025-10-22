import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado en la URL');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) return setError('Token inválido');
    if (String(password).trim().length < 8) return setError('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');

    setLoading(true);
    try {
      const resp = await apiFetch('/api/auth/reset-password', { method: 'POST', body: { token, newPassword: password } });
      if (!resp.ok) {
        setError(resp.data?.msg || 'No se pudo restablecer la contraseña');
      } else {
        setSuccess(true);
        // opcional: redirigir automáticamente a login tras 3s
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (e) {
      console.error('Error reset-password', e);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Restablecer contraseña</h1>
          <p className="text-sm text-gray-600">Introduce una nueva contraseña para tu cuenta.</p>
        </header>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="Repite la contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md font-medium transition-colors ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 text-white'}`}
            >
              {loading ? 'Procesando...' : 'Restablecer contraseña'}
            </button>
          </form>
        ) : (
          <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
            <p>Contraseña restablecida correctamente. Serás redirigido a la página de inicio de sesión.</p>
            <p className="mt-2">Si no eres redirigido automáticamente, <Link to="/login" className="font-medium text-green-700 hover:underline">haz clic aquí</Link>.</p>
          </div>
        )}

        <footer className="text-sm text-center">
          <Link to="/contacto" className="text-green-700 hover:underline">Necesitas ayuda?</Link>
        </footer>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
