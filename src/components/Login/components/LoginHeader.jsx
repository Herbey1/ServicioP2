import React from "react";
import LogoBrochazos from "../../../assets/images/Logo brochazos.png";

export default function LoginHeader({ mode }) {
  return (
    <>
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
    </>
  );
}
