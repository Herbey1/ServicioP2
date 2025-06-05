"use client"

export default function Header({ activeSection, setActiveSection, isAdmin = false, title = "" }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex flex-col">
        {title && <h1 className="text-xl font-bold text-gray-700 mb-2">{title}</h1>}
      </div>
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
    </div>
  )
}
