"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Componentes
import LoginSidebar from "./components/LoginSidebar"
import LoginHeader from "./components/LoginHeader"
import UserTypeSelector from "./components/UserTypeSelector"
import LoginForm from "./components/LoginForm"

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("docente")
  const navigate = useNavigate()
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Concatenar el dominio al correo si no está presente
    const fullEmail = email.includes('@') ? email : `${email}@uabc.edu.mx`;
    
    console.log("Iniciando sesión con:", fullEmail, password, "como", userType)

    if (email && password) {
      // Actualizar el estado de autenticación y el rol del usuario
      setIsAuthenticated(true)
      setUserRole(userType === "administrador" ? "admin" : "docente")
      
      // Redirigir según el tipo de usuario
      if (userType === "docente") {
        navigate('/dashboard')
      } else if (userType === "administrador") {
        navigate('/admin')
      }
    } else {
      console.log("Por favor, completa todos los campos")
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar con imagen y botones de selección de modo */}
      <LoginSidebar />

      {/* Formulario principal */}
      <div className="w-2/3 flex items-center justify-center bg-gray-100">
        <div className="w-[450px] p-8">
          {/* Cabecera con logo y títulos */}
          <LoginHeader />

          {/* Selector de tipo de usuario */}
          <UserTypeSelector userType={userType} setUserType={setUserType} />

          {/* Formulario de login */}
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
