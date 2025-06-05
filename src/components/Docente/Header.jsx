"use client"

export default function Header({ activeSection, setActiveSection, setShowCreateModal }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex bg-gray-200 rounded-full p-1 w-64">
        <button
          onClick={() => setActiveSection("Comisiones")}
          className={`w-1/2 py-2 rounded-full font-medium text-sm transition-all ${
            activeSection === "Comisiones" ? "bg-green-700 text-white" : "text-gray-700 hover:bg-gray-300"
          }`}
        >
          Comisiones
        </button>
        <button
          onClick={() => setActiveSection("Reportes")}
          className={`w-1/2 py-2 rounded-full font-medium text-sm transition-all ${
            activeSection === "Reportes" ? "bg-green-700 text-white" : "text-gray-700 hover:bg-gray-300"
          }`}
        >
          Reportes
        </button>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-800 transition-colors"
        >
          + Crear solicitud
        </button>
      </div>
    </div>
  )
}
