"use client"

import DarkModeToggle from "../../common/DarkModeToggle";
import { useTheme } from "../../../context/ThemeContext";

export default function Header({
  activeSection,
  setActiveSection,
  setShowCreateModal,          // ← para Comisiones
  setShowCreateReporteModal    // ← para Reportes
}) {
  const { darkMode } = useTheme();

  const handleNewClick = () => {
    if (activeSection === "Comisiones") {
      setShowCreateModal(true)
    } else {
      setShowCreateReporteModal(true)
    }
  }

  return (
    <div className={`mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Una sola línea con todos los controles alineados horizontalmente */}
      <div className="flex items-center justify-end gap-4 flex-wrap">
        {/* Toggle de Modo Oscuro */}
        <DarkModeToggle variant="button" />

        {/* Selector de sección (Comisiones / Reportes) */}
        <div className={`flex ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1 w-64`}>
          <button
            onClick={() => setActiveSection("Comisiones")}
            className={`w-1/2 py-2 rounded-full font-medium text-sm transition-all ${
              activeSection === "Comisiones"
                ? "bg-green-700 text-white"
                : darkMode 
                  ? "text-gray-200 hover:bg-gray-600" 
                  : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            Comisiones
          </button>
          <button
            onClick={() => setActiveSection("Reportes")}
            className={`w-1/2 py-2 rounded-full font-medium text-sm transition-all ${
              activeSection === "Reportes"
                ? "bg-green-700 text-white"
                : darkMode 
                  ? "text-gray-200 hover:bg-gray-600" 
                  : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            Reportes
          </button>
        </div>

        {/* Botón de creación dinámico */}
        <button
          onClick={handleNewClick}
          className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-800 transition-colors"
        >
          {activeSection === "Comisiones" ? "+ Crear solicitud" : "+ Crear reporte"}
        </button>
      </div>
    </div>
  )
}
