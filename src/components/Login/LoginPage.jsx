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

        const rol = backendRole === "ADMIN" ? "admin" : "docente";
        setIsAuthenticated(true);
        setUserRole(rol);
        navigate(rol === "docente" ? "/dashboard" : "/admin");
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
    } catch (err) {
      console.error("Error al iniciar sesion", err);
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
