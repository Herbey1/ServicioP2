import React from "react";
import LogoBrochazos from "../../../assets/images/Logo brochazos.png";

export default function LoginHeader() {
  return (
    <>
      <div className="flex justify-center mb-4">
        <img src={LogoBrochazos} alt="UABC Logo" className="h-16 object-contain" />
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">
        Sistema de Gestión de Comisiones Académicas
      </h1>

      <h2 className="text-xl font-semibold text-center mb-4">Iniciar sesión</h2>
    </>
  );
}
