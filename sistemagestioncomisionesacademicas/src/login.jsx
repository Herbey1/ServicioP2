"use client"

import { useState } from "react"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Iniciando sesión con:", email, password)
    // Aquí iría la lógica de autenticación
  }

  return (
    <div className="flex h-screen w-full">
      {/* Imagen lateral */}
      <div className="w-1/3 relative bg-gray-200">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VbV4GYChVgMRaY0KCSCEGHHlxtn6z2.png"
          alt="UABC Mascota"
          className="object-cover h-full w-full"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <button className="bg-white text-gray-800 rounded-full py-2 px-6 w-full font-medium">Iniciar sesión</button>
          <button className="bg-transparent text-white rounded-full py-2 px-6 w-full font-medium">Registrarse</button>
          <div className="text-white text-sm mt-8 text-center">
            ¿Necesitas ayuda? <span className="font-bold">Contáctanos</span>
          </div>
        </div>
      </div>

      {/* Formulario de login */}
      <div className="w-2/3 flex items-center justify-center bg-gray-100">
        <div className="w-[450px] p-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VbV4GYChVgMRaY0KCSCEGHHlxtn6z2.png"
              alt="UABC Logo"
              className="h-16 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-center mb-8">Sistema de Gestión de Comisiones Académicas</h1>

          <h2 className="text-xl font-semibold text-center mb-2">Iniciar Sesión</h2>

          <p className="text-center text-gray-600 mb-6">
            Inicia sesión con tu <span className="font-medium">correo institucional</span>.
          </p>

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
                <a href="#" className="text-gray-500 text-sm">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div className="text-center text-gray-600 text-sm">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-green-700 font-medium">
                Regístrate
              </a>
            </div>

            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-md font-medium mt-4">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

