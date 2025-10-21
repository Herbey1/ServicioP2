"use client"

import { 
  DocumentIcon, 
  ReportIcon, 
  UserIcon, 
  UsersIcon, 
  PowerIcon,
  Bars3Icon,
  ArrowRightIcon,
  AcademicCapIcon
} from "../../common/Icons";

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  toggleSidebar,
  confirmLogout,
  showProfile = true,
  extraItems = []
}) {
  
  const getMenuIcon = (key) => {
    const iconMap = {
      'Comisiones': DocumentIcon,
      'Reportes': ReportIcon,
      'Perfil': UserIcon,
      'Usuarios': UsersIcon
    };
    return iconMap[key] || DocumentIcon;
  };

  const menuItems = [
    { label: "Comisiones", key: "Comisiones", description: "Gestión de solicitudes" },
    { label: "Reportes", key: "Reportes", description: "Informes académicos" },
    ...(showProfile ? [{ label: "Perfil", key: "Perfil", description: "Información personal"}] : []),
    ...extraItems.map(item => ({ ...item, description: item.description || "" }))
  ];
  
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-green-700 
                   transform transition-transform duration-300 ease-in-out z-[1000] shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-6 border-b border-green-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg backdrop-blur-sm">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">SGCA</h2>
                <p className="text-green-200 text-sm">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map(({ label, key, description }) => {
                const Icon = getMenuIcon(key);
                const isActive = activeSection === key;
                
                return (
                  <li key={key}>
                    <button
                      onClick={() => setActiveSection(key)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-white/15 text-white shadow-lg backdrop-blur-sm border border-white/20"
                          : "text-green-100 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                          isActive 
                            ? "bg-green-700 text-white shadow-md" 
                            : "bg-white/10 text-green-200 group-hover:bg-white/15 group-hover:text-white"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">
                              {label}
                            </span>
                            {isActive && (
                              <ArrowRightIcon className="h-4 w-4 text-green-300" />
                            )}
                          </div>
                          {description && (
                            <p className={`text-xs truncate mt-0.5 ${
                              isActive ? "text-green-200" : "text-green-300 group-hover:text-green-200"
                            }`}>
                              {description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info & Logout */}
          <div className="p-6 border-t border-green-700/50 space-y-4">
            {/* User info */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Usuario' : 'Usuario'}
                </p>
                <p className="text-green-200 text-xs truncate">
                  Sesión activa
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={confirmLogout}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 
                       bg-red-600/80 hover:bg-red-600 text-white rounded-lg 
                       transition-all duration-200 font-medium
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-green-800"
            >
              <PowerIcon className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>



      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  )
}
