"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SolicitudesInterface({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState("Pendientes")
  const [activeSection, setActiveSection] = useState("Comisiones") // Nuevo estado para la sección activa
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const tabs = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]

  // Datos de solicitudes por cada pestaña
  const solicitudesPorTab = {
    Pendientes: [
      {
        titulo: "Visita industrial a fábrica de papel en San Francisco",
        solicitante: "Fernando Huerta",
        fechaSalida: "28/08/2025",
        status: "En revisión",
      },
      {
        titulo: "Asistencia al concurso de robótica Premio Lidera",
        solicitante: "Fernando Huerta",
        fechaSalida: "28/08/2025",
        status: "En revisión",
      },
    ],
    Aprobadas: [
      {
        titulo: "Congreso Nacional de Ingeniería Química",
        solicitante: "Fernando Huerta",
        fechaSalida: "15/07/2025",
        status: "Aprobada",
      },
      {
        titulo: "Visita al centro de investigación UNAM",
        solicitante: "Fernando Huerta",
        fechaSalida: "10/09/2025",
        status: "Aprobada",
      },
    ],
    Rechazadas: [
      {
        titulo: "Conferencia internacional en Londres",
        solicitante: "Fernando Huerta",
        fechaSalida: "05/11/2025",
        status: "Rechazada",
      },
    ],
    Devueltas: [
      {
        titulo: "Taller de habilidades docentes en CDMX",
        solicitante: "Fernando Huerta",
        fechaSalida: "20/10/2025",
        status: "Requiere correcciones",
      },
    ],
  }

  // Obtener las solicitudes según la pestaña activa
  const solicitudesActivas = solicitudesPorTab[activeTab] || []

  // Colores para cada status
  const statusColors = {
    "En revisión": {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    "Aprobada": {
      text: "text-green-700",
      bg: "bg-green-100",
    },
    "Rechazada": {
      text: "text-red-700",
      bg: "bg-red-100",
    },
    "Requiere correcciones": {
      text: "text-orange-700",
      bg: "bg-orange-100",
    },
  }

  // Función para mostrar confirmación de logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/login')
  }

  // Función para cancelar el cierre de sesión
  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  // Función para alternar sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Hamburger Menu Button */}
      <label 
        htmlFor="nav-toggle" 
        className="fixed top-4 left-4 z-50 cursor-pointer"
        onClick={toggleSidebar}
      >
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white' : 'bg-green-800'}`}></div>
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white w-0' : 'bg-green-800'}`}></div>
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white transform -translate-y-2 -rotate-45' : 'bg-green-800'}`}></div>
      </label>
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-green-800 transform transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full py-12 px-6">
          <div className="flex-1">
            <ul className="mt-12 space-y-6">
              <li>
                <a 
                  href="#" 
                  onClick={() => setActiveSection("Comisiones")} 
                  className="text-white text-xl hover:text-green-200 relative group flex items-center"
                >
                  <span>Comisiones</span>
                  <span className={`absolute h-0.5 bg-white bottom-0 left-0 transition-all duration-300 ${activeSection === "Comisiones" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={() => setActiveSection("Reportes")} 
                  className="text-white text-xl hover:text-green-200 relative group flex items-center"
                >
                  <span>Reportes</span>
                  <span className={`absolute h-0.5 bg-white bottom-0 left-0 transition-all duration-300 ${activeSection === "Reportes" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-xl hover:text-green-200 relative group flex items-center">
                  <span>Perfil</span>
                  <span className="absolute h-0.5 w-0 bg-white bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Logout Button Inside Sidebar */}
          <button 
            onClick={confirmLogout}
            className="text-white border-2 border-white py-2 px-8 rounded-full hover:bg-white hover:text-green-800 transition-colors duration-300"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      {/* Pestaña lateral para abrir el sidebar cuando está cerrado */}
      {!sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-green-800 text-white py-4 px-2 rounded-r-md cursor-pointer z-40 shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`flex-1 bg-white p-8 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header con botones tipo pill como en login */}
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
            <button className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium">
              + Crear solicitud
            </button>
          </div>
        </div>

        {/* Título dinámico según la sección activa */}
        <h2 className="text-2xl font-bold mb-6">
          {activeSection === "Comisiones" ? "Mis solicitudes" : "Mis reportes"}
        </h2>

        {/* Contenido condicional según la sección */}
        {activeSection === "Comisiones" ? (
          <>
            {/* Pestañas tipo "pill" - ancho completo */}
            <div className="flex w-full mb-6 rounded-full overflow-hidden border border-gray-300">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center py-2 font-medium text-sm transition-all ${
                    activeTab === tab
                      ? "bg-green-700 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Lista de Solicitudes */}
            <div className="space-y-4 flex-1 overflow-y-auto">
              {solicitudesActivas.length > 0 ? (
                solicitudesActivas.map((solicitud, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{solicitud.titulo}</h3>
                      <p className="text-sm text-gray-600">{solicitud.solicitante}</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Fecha de Salida:</p>
                        <p className="font-medium">{solicitud.fechaSalida}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status:</p>
                        <p className={`${statusColors[solicitud.status]?.text || 'text-gray-700'} ${statusColors[solicitud.status]?.bg || 'bg-gray-100'} rounded px-2 py-0.5 inline-block text-sm font-semibold`}>
                          {solicitud.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No hay solicitudes {activeTab.toLowerCase()}
                </div>
              )}

              {/* Espacios vacíos solo si no hay suficientes solicitudes reales */}
              {solicitudesActivas.length === 0 && (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl px-4 py-6 h-[60px]" />
                ))
              )}
            </div>
          </>
        ) : (
          // Contenido para la sección de Reportes
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-lg mb-4">Sección de Reportes</div>
            <p className="text-gray-400 text-center">
              Esta sección está en desarrollo.<br />
              Aquí podrás ver todos tus reportes de comisiones académicas.
            </p>
          </div>
        )}
      </div>

      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Cerrar sesión</h3>
            <p className="text-gray-700 mb-6">¿Estás seguro que deseas cerrar tu sesión actual?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelLogout}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
