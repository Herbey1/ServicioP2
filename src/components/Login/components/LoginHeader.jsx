import React from "react";
import UABClogo from "../../../assets/images/Logo brochazos.png";
import { AcademicCapIcon } from "../../common/Icons";

export default function LoginHeader() {
  return (
    <div className="text-center mb-4">
      {/* Logo Container - Más pequeño */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <div className="relative bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
            <img 
              src={UABClogo} 
              alt="UABC - Universidad Autónoma de Baja California" 
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>
      </div>

      {/* System Title - Más compacto */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-center space-x-2">
          <AcademicCapIcon className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            SGCA
          </h1>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
          Sistema de Gestión de Comisiones Académicas - FCQI
        </p>
      </div>

      {/* Welcome Message - Perfectamente centrado */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg py-2 px-3 mx-2 my-3">
        <h2 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-0.5">
          Bienvenido
        </h2>
        <p className="text-xs text-green-700 dark:text-green-300">
          Accede a tu cuenta institucional
        </p>
      </div>
    </div>
  );
}
