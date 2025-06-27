"use client"

export default function Header({
  activeSection,
  setActiveSection,
  setShowCreateModal,          // ← para Comisiones
  setShowCreateReporteModal    // ← para Reportes
}) {
  const handleNewClick = () => {
    if (activeSection === "Comisiones") {
      setShowCreateModal(true)
    } else {
      setShowCreateReporteModal(true)
    }
  }

  return (
    <div className="flex justify-between items-center mb-8">
      {/* Selector de sección (Comisiones / Reportes) */}
      <div className="flex bg-gray-200 rounded-full p-1 w-64">
        <button
          onClick={() => setActiveSection("Comisiones")}
          className={`w-1/2 py-2 rounded-full font-medium text-sm transition-all ${
            activeSection === "Comisiones"
              ? "bg-green-700 text-white"
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
  )
}
