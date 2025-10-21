import React from "react";

export default function LoginForm({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleSubmit,
  errorMessage,
  isLoading
}) {
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-1">Usuario</label>
        <div className="flex">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Ingresa tu correo institucional"
          />
          <span className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-md p-2 text-gray-500">
            @uabc.edu.mx
          </span>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Ingresa tu contraseña"
        />
        <div className="text-right mt-1">
          <a href="#" className="text-gray-500 text-sm">¿Olvidaste tu contraseña?</a>
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm mt-2" role="alert">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className={`w-full py-3 rounded-md font-medium mt-4 transition-colors ${
          canSubmit && !isLoading
            ? 'bg-green-700 text-white hover:bg-green-800 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
