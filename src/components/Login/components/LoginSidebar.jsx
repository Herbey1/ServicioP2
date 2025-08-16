import React from "react";
import LogoUABC from "../../../assets/images/logo uabc.jpg";

export default function LoginSidebar() {
  return (
    <div className="w-1/3 relative bg-gray-200">
      <img src={LogoUABC} alt="UABC Mascota" className="object-cover h-full w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-white text-sm text-center">
          ¿Necesitas ayuda? <span className="font-bold">Contáctanos</span>
        </div>
      </div>
    </div>
  );
}
