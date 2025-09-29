"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import LoginSidebar from "./components/LoginSidebar";
import LoginHeader from "./components/LoginHeader";
import UserTypeSelector from "./components/UserTypeSelector";
import LoginForm from "./components/LoginForm";

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("docente");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const fullEmail = cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@uabc.edu.mx`;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { correo: fullEmail, password: cleanPassword },
      });

      if (res.ok) {
        const { token, user } = res.data;
        setErrorMessage("");
        localStorage.setItem("token", token);
        localStorage.setItem("userName", user?.nombre ?? "");

        const rol = user?.rol === "ADMIN" ? "admin" : "docente";
        setIsAuthenticated(true);
        setUserRole(rol);
        navigate(rol === "docente" ? "/dashboard" : "/admin");
      } else if (res.status === 401) {
        setErrorMessage("Credenciales inválidas. Verifica tu usuario y contraseña.");
      } else {
        setErrorMessage("Ocurrió un error en el servidor.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      setErrorMessage("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="flex h-screen w-full">
      <LoginSidebar />
      <div className="w-2/3 flex items-center justify-center bg-gray-100">
        <div className="w-[450px] p-8">
          <LoginHeader />
          <UserTypeSelector userType={userType} setUserType={setUserType} />
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
