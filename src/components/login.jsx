"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import LogoBrochazos from "../assets/images/Logo brochazos.png"
import LogoUABC from "../assets/images/logo uabc.jpg"

function LoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("docente")
  const [mode, setMode] = useState("login") 
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(`${mode === "login" ? "Iniciando sesión" : "Registrando"} con:`, email, password, "como", userType)

    if (email && password) {
      setIsAuthenticated(true)
      navigate('/dashboard')
    } else {
      console.log("Por favor, completa todos los campos")
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Imagen lateral con botones */}
      <div className="w-1/3 relative bg-gray-200">
        <img src={LogoUABC} alt="UABC Mascota" className="object-cover h-full w-full" />
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full py-2 px-6 w-full font-medium ${
              mode === "login" ? "bg-white text-gray-800" : "bg-transparent text-white border border-white"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`rounded-full py-2 px-6 w-full font-medium ${
              mode === "register" ? "bg-white text-gray-800" : "bg-transparent text-white border border-white"
            }`}
          >
            Registrarse
          </button>
          <div className="text-white text-sm mt-8 text-center">
            ¿Necesitas ayuda? <span className="font-bold">Contáctanos</span>
          </div>
        </div>
      </div>

      {/* Formulario principal */}
      <div className="w-2/3 flex items-center justify-center bg-gray-100">
        <div className="w-[450px] p-8">
          <div className="flex justify-center mb-4">
            <img src={LogoBrochazos} alt="UABC Logo" className="h-16 object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-8">
            Sistema de Gestión de Comisiones Académicas
          </h1>

          <h2 className="text-xl font-semibold text-center mb-2">
            {mode === "login" ? "Iniciar Sesión" : "Crear una Cuenta"}
          </h2>
          <p className="text-center text-gray-600 mb-4">Selecciona tu tipo de usuario:</p>

          {/* Selector tipo pill */}
          <div className="flex bg-gray-200 rounded-full p-1 mb-6 w-full">
            <button
              onClick={() => setUserType("docente")}
              className={`w-1/2 py-2 rounded-full font-medium transition ${
                userType === "docente" ? "bg-green-700 text-white" : "text-black"
              }`}
            >
              Docente
            </button>
            <button
              onClick={() => setUserType("administrador")}
              className={`w-1/2 py-2 rounded-full font-medium transition ${
                userType === "administrador" ? "bg-green-700 text-white" : "text-black"
              }`}
            >
              Administrador
            </button>
          </div>

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
        </div>
      </div>
    </div>
  )
}

export default LoginPage
