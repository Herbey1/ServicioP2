"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
// LoginSidebar removed - using full-screen background
import LoginHeader from "./components/LoginHeader";
import UserTypeSelector from "./components/UserTypeSelector";
import LoginForm from "./components/LoginForm";
import BgImage from "../../assets/images/fcqi-background.jpg";

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("docente");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const fullEmail = cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@uabc.edu.mx`;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }

    const roleMap = {
      docente: "DOCENTE",
      administrador: "ADMIN",
    };
    const expectedRole = roleMap[userType] ?? "DOCENTE";

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: {
          correo: fullEmail,
          password: cleanPassword,
          rolEsperado: expectedRole,
          userType,
        },
      });

      if (response.ok && response.data?.ok) {
        const { token, user } = response.data;
        const backendRole = typeof user?.rol === "string" ? user.rol.trim().toUpperCase() : "";

        if (backendRole !== expectedRole) {
          setErrorMessage("El correo no corresponde al tipo de usuario seleccionado.");
          return;
        }

        setErrorMessage("");
        localStorage.setItem("token", token);
        localStorage.setItem("userName", user?.nombre ?? "");
        if (user?.must_change_password) {
          try { localStorage.setItem('mustChangePassword', '1'); } catch {}
        }

        const rol = backendRole === "ADMIN" ? "admin" : "docente";
        setIsAuthenticated(true);
        setUserRole(rol);
        navigate(rol === "docente" ? "/dashboard" : "/admin");
        setIsLoading(false);
        return;
      }

      const serverMessage =
        response.data?.msg ||
        (response.status === 401
          ? "Credenciales invalidas. Verifica tu usuario y contrasena."
          : response.status === 403
          ? "El correo no corresponde al tipo de usuario seleccionado."
          : response.status === 400
          ? "Selecciona un tipo de usuario valido."
          : "Ocurrio un error en el servidor.");
      setErrorMessage(serverMessage);
      setIsLoading(false);
    } catch (err) {
      console.error("Error al iniciar sesion", err);
      setErrorMessage("No se pudo conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      {/* Fullscreen background with centered card */}
      <div className="flex-1 flex items-center justify-center">
  <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 m-6">
          <LoginHeader />
          <UserTypeSelector userType={userType} setUserType={setUserType} />
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            errorMessage={errorMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
