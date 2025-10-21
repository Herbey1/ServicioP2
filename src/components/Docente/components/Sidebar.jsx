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
  // Sidebar estilo aside con gradiente y botones con hover

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[250px] transform transition-transform duration-300 ease-in-out z-40 rounded-r-3xl font-sans ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className="h-full bg-gradient-to-br from-green-700 to-green-600">
          <div className="h-full text-white w-full p-6 pt-8 flex flex-col">
            <h1 className="text-base font-semibold mb-4">Menú lateral</h1>

            <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
              {[
                { label: "Comisiones", key: "Comisiones", description: "Gestión de solicitudes" },
                { label: "Reportes", key: "Reportes", description: "Informes académicos" },
                ...(showProfile ? [{ label: "Perfil", key: "Perfil", description: "Información personal" }] : []),
                ...extraItems
              ].map(({ label, key, description }) => {
                const isActive = activeSection === key;
                return (
                  <div key={key} className="relative">
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white/90 rounded-r-md" />
                    )}
                      <div className={`w-full rounded-l-2xl transition-all duration-200 ${isActive ? 'bg-white shadow-md' : 'hover:bg-white'}`}>
                        <button
                          onClick={() => setActiveSection(key)}
                          className={`w-full text-left flex flex-col py-3 px-6 rounded-l-2xl focus:outline-none group ${isActive ? 'text-green-700 font-medium' : 'text-white'}`}
                        >
                          <span className={`text-sm truncate ${isActive ? 'text-green-700' : 'group-hover:text-green-700'}`}>{label}</span>
                          {description && (
                            <span className={`text-xs mt-1 ${isActive ? 'text-green-600' : 'text-white/90 group-hover:text-green-700'}`}>{description}</span>
                          )}
                        </button>
                      </div>
                  </div>
                );
              })}
            </nav>

            {/* Session info directly above logout */}
            <div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">U</div>
                  <div>
                    <div className="text-sm font-medium">{typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Usuario' : 'Usuario'}</div>
                    <div className="text-xs text-white/90">Sesión activa</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={confirmLogout}
                className="w-full text-center py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Pestaña lateral (sidebar cerrado) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 bottom-8 bg-gradient-to-br from-green-700 to-green-600 text-white h-12 w-12 rounded-r-lg cursor-pointer z-40 shadow-md hover:from-green-600 hover:to-green-500 transition-colors duration-300 flex items-center justify-center"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30" onClick={toggleSidebar} />
      )}
    </>
  )
}
