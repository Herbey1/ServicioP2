"use client"

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  toggleSidebar,
  confirmLogout,
  showProfile = true,
  extraItems = []
}) {
  // Ya no necesitamos darkMode aquí ya que eliminamos el menú hamburguesa
  
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-green-800 transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full py-12 px-6">
          <ul className="mt-12 space-y-6 flex-1">
            {[
              { label: "Comisiones", key: "Comisiones" },
              { label: "Reportes", key: "Reportes" },
              ...(showProfile ? [{ label: "Perfil", key: "Perfil"}] : []),
              ...extraItems
            ].map(({ label, key }) => (
              <li key={key}>
                <button
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left text-xl relative group ${
                    activeSection === key
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                      activeSection === key ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={confirmLogout}
            className="text-white border-2 border-white py-2 px-8 rounded-full hover:bg-white hover:text-green-800 transition-colors duration-300"
          >
            Cerrar sesión
          </button>
        </div>      </div>
      
      {/* Pestaña lateral (sidebar cerrado) */}
      {!sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-green-800 text-white py-4 px-2 rounded-r-md cursor-pointer z-40 shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30" onClick={toggleSidebar} />
      )}
    </>
  )
}
