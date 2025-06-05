import React from "react";

export default function LoginForm({ 
  mode, 
  setMode, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleSubmit 
}) {
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
        {mode === "login" && (
          <div className="text-right mt-1">
            <a href="#" className="text-gray-500 text-sm">¿Olvidaste tu contraseña?</a>
          </div>
        )}
      </div>

      <div className="text-center text-gray-600 text-sm">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="text-green-700 font-medium"
              onClick={() => setMode("register")}
            >
              Regístrate
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="text-green-700 font-medium"
              onClick={() => setMode("login")}
            >
              Inicia sesión
            </button>
          </>
        )}
      </div>

      <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-md font-medium mt-4">
        {mode === "login" ? "Iniciar sesión" : "Registrarse"}
      </button>
    </form>
  );
}
