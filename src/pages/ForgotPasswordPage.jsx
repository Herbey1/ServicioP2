import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { correo: email } });
      if (!resp.ok) {
        setError(resp.data?.msg || 'No se pudo procesar la solicitud');
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      console.error('Error enviando forgot-password', e);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Recupera tu contraseña</h1>
          <p className="text-sm text-gray-600">
            Ingresa el correo institucional con el que accedes al sistema. Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="recovery-email">
              Correo institucional
            </label>
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="tu.usuario@uabc.edu.mx"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-medium transition-colors ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 text-white'}`}
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>

        {submitted && (
          <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
            <p>
              Si el correo está registrado, recibirás un mensaje con los pasos para restablecer la contraseña.
              Revisa tu bandeja principal y la carpeta de spam.
            </p>
          </div>
        )}

        <footer className="flex items-center justify-between text-sm">
          <Link to="/contacto" className="text-green-700 font-medium hover:underline">
            Necesito más ayuda
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-green-700 font-medium">
            Iniciar sesión
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
