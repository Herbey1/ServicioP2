"use client"

import DarkModeToggle from "../../common/DarkModeToggle";
import { useTheme } from "../../../context/ThemeContext";

export default function Header({
  activeSection,
  setActiveSection,
  isAdmin = false,
  title = "",
  onAddDocenteClick,
  onRefreshComisiones,
  disableAddDocente = false,
  searchValue = "",
  onSearchChange = () => {},
  searchPlaceholder = "",
  showSearch = false
}) {
  const { darkMode } = useTheme();

  const showSectionSwitch = activeSection !== "Usuarios";
  const canShowSearch = showSearch && activeSection !== "Usuarios";
  const searchInputClass = `w-full sm:w-64 pl-4 pr-6 py-2 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'}`;

  return (
    <div className={`flex flex-col gap-4 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {title && (
          <div className="flex items-center gap-3">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              {title}
            </h1>
            {isAdmin && activeSection === 'Comisiones' && onRefreshComisiones && (
              <button
                onClick={onRefreshComisiones}
                className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Refrescar comisiones"
                title="Refrescar comisiones"
              >
                {/* Feather refresh-cw icon (stroke) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path>
                  <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path>
                </svg>
              </button>
            )}
            {canShowSearch && (
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || "Buscar..."}
                className={searchInputClass}
                aria-label="Buscar"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-3 justify-between md:justify-end md:min-w-[220px]">
          <DarkModeToggle />

          {showSectionSwitch && (
            <div className={`flex ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1 w-full sm:w-64`}>
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
          )}
        </div>
      </div>

      {isAdmin && onAddDocenteClick && activeSection === "Usuarios" && (
        <div className="flex justify-end">
          <button
            onClick={onAddDocenteClick}
            disabled={disableAddDocente}
            className={`bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            + Agregar usuario
          </button>
        </div>
      )}
    </div>
  )
}
