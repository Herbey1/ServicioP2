import React from "react";

export default function UserTypeSelector({ userType, setUserType }) {
  return (
    <div className="flex bg-gray-200 rounded-full p-1 mb-6 w-full">
      <button
        onClick={() => setUserType("docente")}
        className={`w-1/2 py-2 rounded-full font-medium transition ${
          userType === "docente" ? "bg-green-700 text-white" : "text-black"
        }`}
      >
        Docente
      </button>
      <button
        onClick={() => setUserType("administrador")}
        className={`w-1/2 py-2 rounded-full font-medium transition ${
          userType === "administrador" ? "bg-green-700 text-white" : "text-black"
        }`}
      >
        Administrador
      </button>
    </div>
  );
}
