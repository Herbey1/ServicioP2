import React from "react";
import LogoUABC from "../../../assets/images/logo uabc.jpg";

export default function LoginSidebar({ mode, setMode }) {
  return (
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
  );
}
