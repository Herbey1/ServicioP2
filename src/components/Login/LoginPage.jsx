"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import LoginSidebar from "./components/LoginSidebar";
import LoginHeader from "./components/LoginHeader";
import UserTypeSelector from "./components/UserTypeSelector";
import LoginForm from "./components/LoginForm";
import { useToast } from "../../context/ToastContext";

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("docente");
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const fullEmail = cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@uabc.edu.mx`;

    if (!cleanEmail || !cleanPassword) {
      showToast("Por favor completa todos los campos.", { type: "error" });
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
          showToast("El correo no corresponde al tipo de usuario seleccionado.", { type: "error" });
          return;
        }

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
      showToast(serverMessage, { type: "error" });
    } catch (err) {
      console.error("Error al iniciar sesion", err);
      showToast("No se pudo conectar con el servidor.", { type: "error" });
    }
  };

  return (
    <div className="full-page-container bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 min-h-screen w-full">
        <LoginSidebar />
        
        <div className="flex flex-1 items-center justify-center p-2 lg:p-4 min-h-screen">
          <div className="w-full max-w-sm no-overlap">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
              <LoginHeader />
              <UserTypeSelector userType={userType} setUserType={setUserType} />
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
              />
            </div>
            
            {/* Footer */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              © 2025 UABC - FCQI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
