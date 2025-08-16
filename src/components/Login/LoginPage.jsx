"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullEmail = email.includes('@') ? email : `${email}@uabc.edu.mx`;
    
    if (!email || !password){
      console.log("Por favor, completa todos los campos")
      return;
    }

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { correo: fullEmail, password }
      });

      if (data?.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.nombre);
        const rol = data.user.rol === 'ADMIN' ? 'admin' : 'docente';
        setIsAuthenticated(true);
        setUserRole(rol);
        if (rol === 'docente') navigate('/dashboard');
        else navigate('/admin');
     } else {
      console.log("Credenciales inválidas");
     }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
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
