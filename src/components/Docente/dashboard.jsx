"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SolicitudesInterface({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState("Pendientes")
  const [activeSection, setActiveSection] = useState("Comisiones")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalEditData, setModalEditData] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSolicitud, setNewSolicitud] = useState({
    titulo: "",
    solicitante: "Fernando Huerta",
    tipoParticipacion: "Asistente",
    ciudad: "",
    pais: "",
    lugar: "",
    fechaSalida: "",
    fechaRegreso: "",
    horaSalida: "",
    horaRegreso: "", 
    numeroPersonas: 1,
    necesitaTransporte: false,
    cantidadCombustible: 0,
    programaEducativo: "Ingeniería en Computación",
    proyectoInvestigacion: false,
    obtendraConstancia: true,
    comentarios: "",
    status: "En revisión"
  })

  const navigate = useNavigate()

  const tabs = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]

  // Opciones para los selectores
  const tiposParticipacion = ["Ponente", "Asistente", "Organizador", "Jurado", "Otro"]
  const programasEducativos = ["Ingeniería Industrial", "Ingeniería Civil", "Ingeniería en Computación", "Ingeniería Química", "Ingeniería Electrónica", "Bioingeniería"]

  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes: [],
    Aprobadas: [
      {
        titulo: "Congreso Nacional de Ingeniería Química",
        solicitante: "Fernando Huerta",
        tipoParticipacion: "Ponente",
        ciudad: "Ciudad de México",
        pais: "México",
        lugar: "UNAM",
        fechaSalida: "2025-07-15",
        fechaRegreso: "2025-07-18",
        horaSalida: "07:00",
        horaRegreso: "20:00", 
        numeroPersonas: 1,
        necesitaTransporte: false,
        cantidadCombustible: 0,
        programaEducativo: "Ingeniería Química",
        proyectoInvestigacion: true,
        obtendraConstancia: true,
        comentarios: "Presentación de resultados del proyecto CONACYT",
        status: "Aprobada",
      }
    ],
    Rechazadas: [
      {
        titulo: "Conferencia internacional en Londres",
        solicitante: "Fernando Huerta",
        tipoParticipacion: "Ponente",
        ciudad: "Londres",
        pais: "Reino Unido",
        lugar: "Imperial College",
        fechaSalida: "2025-11-05",
        fechaRegreso: "2025-11-12",
        horaSalida: "07:00",
        horaRegreso: "14:00", 
        numeroPersonas: 1,
        necesitaTransporte: false,
        cantidadCombustible: 0,
        programaEducativo: "Ingeniería Civil",
        proyectoInvestigacion: true,
        obtendraConstancia: true,
        comentarios: "Fuera de presupuesto y fechas",
        status: "Rechazada",
      }
    ],
    Devueltas: []
  })

  const statusColors = {
    "En revisión": { text: "text-yellow-700", bg: "bg-yellow-100" },
    "Aprobada": { text: "text-green-700", bg: "bg-green-100" },
    "Rechazada": { text: "text-red-700", bg: "bg-red-100" },
    "Requiere correcciones": { text: "text-orange-700", bg: "bg-orange-100" },
  }

  const solicitudesActivas = solicitudesPorTab[activeTab] || []

  const confirmLogout = () => setShowLogoutConfirm(true)
  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/login')
  }
  const cancelLogout = () => setShowLogoutConfirm(false)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleEditClick = (solicitud, index) => {
    setModalEditData({ ...solicitud, index, tab: activeTab })
  }

  const handleSaveEdit = () => {
    const { titulo, solicitante, tipoParticipacion, ciudad, pais, lugar, fechaSalida, fechaRegreso, 
      horaSalida, horaRegreso, numeroPersonas, necesitaTransporte, cantidadCombustible, programaEducativo,
      proyectoInvestigacion, obtendraConstancia, comentarios, tab, index } = modalEditData
    
    // Creamos el objeto de solicitud actualizado
    const updatedSolicitud = { 
      titulo, solicitante, tipoParticipacion, ciudad, pais, lugar, fechaSalida, fechaRegreso, 
      horaSalida, horaRegreso, numeroPersonas, necesitaTransporte, cantidadCombustible, programaEducativo,
      proyectoInvestigacion, obtendraConstancia, comentarios,
      status: "En revisión" 
    }

    // Si la solicitud estaba en "Devueltas", la movemos a "Pendientes"
    if (tab === "Devueltas") {
      // Eliminamos la solicitud de "Devueltas"
      const newDevueltasList = solicitudesPorTab.Devueltas.filter((_, i) => i !== index)
      
      // Añadimos la solicitud actualizada a "Pendientes"
      const newPendientesList = [...solicitudesPorTab.Pendientes, updatedSolicitud]
      
      setSolicitudesPorTab({ 
        ...solicitudesPorTab, 
        Devueltas: newDevueltasList,
        Pendientes: newPendientesList
      })

      // Cambiamos a la pestaña Pendientes para ver la solicitud
      setActiveTab("Pendientes")
    } else {
      // Si no es de "Devueltas", actualizamos en la pestaña actual
      const updatedList = [...solicitudesPorTab[tab]]
      updatedList[index] = updatedSolicitud
      
      setSolicitudesPorTab({ ...solicitudesPorTab, [tab]: updatedList })
    }
    
    // Cerramos el modal
    setModalEditData(null)
  }

  const handleCreateSolicitud = () => {
    // Validación básica (podrías agregar más validaciones según necesites)
    if (!newSolicitud.titulo || !newSolicitud.ciudad || !newSolicitud.pais || !newSolicitud.lugar || 
        !newSolicitud.fechaSalida || !newSolicitud.fechaRegreso) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    
    // Agregar la nueva solicitud a las pendientes
    const updatedPendientes = [...solicitudesPorTab.Pendientes, newSolicitud];
    
    setSolicitudesPorTab({
      ...solicitudesPorTab,
      Pendientes: updatedPendientes
    });
    
    // Cambiar a la pestaña de pendientes para ver la nueva solicitud
    setActiveTab("Pendientes");
    
    // Limpiar el formulario y cerrar el modal
    setNewSolicitud({
      titulo: "",
      solicitante: "Fernando Huerta",
      tipoParticipacion: "Asistente",
      ciudad: "",
      pais: "",
      lugar: "",
      fechaSalida: "",
      fechaRegreso: "",
      horaSalida: "",
      horaRegreso: "", 
      numeroPersonas: 1,
      necesitaTransporte: false,
      cantidadCombustible: 0,
      programaEducativo: "Ingeniería en Computación",
      proyectoInvestigacion: false,
      obtendraConstancia: true,
      comentarios: "",
      status: "En revisión"
    });
    
    setShowCreateModal(false);
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
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-800 transition-colors"
            >
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
                    <div className="flex items-center gap-4">
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
                      {["En revisión", "Requiere correcciones"].includes(solicitud.status) && (
                        <button
                          onClick={() => handleEditClick(solicitud, index)}
                          className="text-green-700 hover:text-green-900 font-medium text-sm"
                        >
                          Editar
                        </button>
                      )}
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

      {/* Modal de Creación de Solicitud */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
              <h3 className="text-xl font-bold">Crear solicitud</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Información del solicitante */}
              <div className="col-span-2 mb-2">
                <div className="flex justify-between">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Nombre del docente:</span>
                    <span className="text-gray-900">{newSolicitud.solicitante}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Número de empleado:</span>
                    <span className="text-gray-900">123456</span>
                  </div>
                </div>
              </div>
              
              {/* Título de la comisión */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.titulo}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, titulo: e.target.value })}
                  placeholder="Título de la comisión"
                  required
                />
              </div>
              
              {/* Tipo de participación (selector) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de participación: <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.tipoParticipacion}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, tipoParticipacion: e.target.value })}
                >
                  {tiposParticipacion.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              {/* Ciudad y País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad / País: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={newSolicitud.ciudad}
                    onChange={(e) => setNewSolicitud({ ...newSolicitud, ciudad: e.target.value })}
                    placeholder="Ciudad"
                    required
                  />
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={newSolicitud.pais}
                    onChange={(e) => setNewSolicitud({ ...newSolicitud, pais: e.target.value })}
                    placeholder="País"
                    required
                  />
                </div>
              </div>
              
              {/* Lugar */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar específico: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.lugar}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, lugar: e.target.value })}
                  placeholder="Lugar específico donde se realizará la actividad"
                  required
                />
              </div>
              
              {/* Fechas de salida y regreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de salida: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.fechaSalida}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaSalida: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de regreso: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.fechaRegreso}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaRegreso: e.target.value })}
                  required
                />
              </div>
              
              {/* Horas de salida y regreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de salida: <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.horaSalida}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, horaSalida: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de regreso: <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.horaRegreso}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, horaRegreso: e.target.value })}
                  required
                />
              </div>
              
              {/* Número de personas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de personas: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.numeroPersonas}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, numeroPersonas: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              
              {/* Necesita transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Necesita unidad de transporte?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="necesitaTransporteNuevo"
                      checked={newSolicitud.necesitaTransporte === true}
                      onChange={() => setNewSolicitud({ ...newSolicitud, necesitaTransporte: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="necesitaTransporteNuevo"
                      checked={newSolicitud.necesitaTransporte === false}
                      onChange={() => setNewSolicitud({ ...newSolicitud, necesitaTransporte: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Cantidad de combustible (si necesita transporte) */}
              {newSolicitud.necesitaTransporte && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de combustible (litros):
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={newSolicitud.cantidadCombustible}
                    onChange={(e) => setNewSolicitud({ ...newSolicitud, cantidadCombustible: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
              
              {/* Programa educativo */}
              <div className={newSolicitud.necesitaTransporte ? "col-span-1" : "col-span-2"}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa educativo que apoya: <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.programaEducativo}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, programaEducativo: e.target.value })}
                  required
                >
                  {programasEducativos.map(programa => (
                    <option key={programa} value={programa}>{programa}</option>
                  ))}
                </select>
              </div>
              
              {/* Proyecto de investigación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proyecto de investigación:
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="proyectoInvestigacionNuevo"
                      checked={newSolicitud.proyectoInvestigacion === true}
                      onChange={() => setNewSolicitud({ ...newSolicitud, proyectoInvestigacion: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="proyectoInvestigacionNuevo"
                      checked={newSolicitud.proyectoInvestigacion === false}
                      onChange={() => setNewSolicitud({ ...newSolicitud, proyectoInvestigacion: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Se obtendrá constancia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Se obtendrá constancia?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="obtendraConstanciaNuevo"
                      checked={newSolicitud.obtendraConstancia === true}
                      onChange={() => setNewSolicitud({ ...newSolicitud, obtendraConstancia: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="obtendraConstanciaNuevo"
                      checked={newSolicitud.obtendraConstancia === false}
                      onChange={() => setNewSolicitud({ ...newSolicitud, obtendraConstancia: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Comentarios adicionales */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios adicionales:
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  value={newSolicitud.comentarios}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, comentarios: e.target.value })}
                  placeholder="Comentarios adicionales sobre la actividad"
                ></textarea>
              </div>

              {/* Nota sobre campos obligatorios */}
              <div className="col-span-2 mt-2">
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Campos obligatorios
                </p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSolicitud}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición mejorado */}
      {modalEditData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Editar Solicitud</h3>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Título de la comisión */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la comisión
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.titulo}
                  onChange={(e) => setModalEditData({ ...modalEditData, titulo: e.target.value })}
                />
              </div>
              
              {/* Solicitante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solicitante
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.solicitante}
                  onChange={(e) => setModalEditData({ ...modalEditData, solicitante: e.target.value })}
                />
              </div>
              
              {/* Tipo de participación (selector) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de participación
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.tipoParticipacion}
                  onChange={(e) => setModalEditData({ ...modalEditData, tipoParticipacion: e.target.value })}
                >
                  {tiposParticipacion.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.ciudad}
                  onChange={(e) => setModalEditData({ ...modalEditData, ciudad: e.target.value })}
                />
              </div>
              
              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.pais}
                  onChange={(e) => setModalEditData({ ...modalEditData, pais: e.target.value })}
                />
              </div>
              
              {/* Lugar */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar específico
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.lugar}
                  onChange={(e) => setModalEditData({ ...modalEditData, lugar: e.target.value })}
                />
              </div>
              
              {/* Fechas de salida y regreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de salida
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.fechaSalida}
                  onChange={(e) => setModalEditData({ ...modalEditData, fechaSalida: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de regreso
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.fechaRegreso}
                  onChange={(e) => setModalEditData({ ...modalEditData, fechaRegreso: e.target.value })}
                />
              </div>
              
              {/* Horas de salida y regreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de salida
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.horaSalida}
                  onChange={(e) => setModalEditData({ ...modalEditData, horaSalida: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de regreso
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.horaRegreso}
                  onChange={(e) => setModalEditData({ ...modalEditData, horaRegreso: e.target.value })}
                />
              </div>
              
              {/* Número de personas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de personas
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.numeroPersonas}
                  onChange={(e) => setModalEditData({ ...modalEditData, numeroPersonas: parseInt(e.target.value) })}
                />
              </div>
              
              {/* Necesita transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Necesita unidad de transporte?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="necesitaTransporte"
                      checked={modalEditData.necesitaTransporte === true}
                      onChange={() => setModalEditData({ ...modalEditData, necesitaTransporte: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="necesitaTransporte"
                      checked={modalEditData.necesitaTransporte === false}
                      onChange={() => setModalEditData({ ...modalEditData, necesitaTransporte: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Cantidad de combustible (si necesita transporte) */}
              {modalEditData.necesitaTransporte && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de combustible (litros)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={modalEditData.cantidadCombustible}
                    onChange={(e) => setModalEditData({ ...modalEditData, cantidadCombustible: parseInt(e.target.value) })}
                  />
                </div>
              )}
              
              {/* Programa educativo */}
              <div className={modalEditData.necesitaTransporte ? "col-span-1" : "col-span-2"}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa educativo que apoya
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.programaEducativo}
                  onChange={(e) => setModalEditData({ ...modalEditData, programaEducativo: e.target.value })}
                >
                  {programasEducativos.map(programa => (
                    <option key={programa} value={programa}>{programa}</option>
                  ))}
                </select>
              </div>
              
              {/* Proyecto de investigación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Es proyecto de investigación?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="proyectoInvestigacion"
                      checked={modalEditData.proyectoInvestigacion === true}
                      onChange={() => setModalEditData({ ...modalEditData, proyectoInvestigacion: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="proyectoInvestigacion"
                      checked={modalEditData.proyectoInvestigacion === false}
                      onChange={() => setModalEditData({ ...modalEditData, proyectoInvestigacion: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Se obtendrá constancia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Se obtendrá constancia?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="obtendraConstancia"
                      checked={modalEditData.obtendraConstancia === true}
                      onChange={() => setModalEditData({ ...modalEditData, obtendraConstancia: true })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio"
                      className="form-radio text-green-700"
                      name="obtendraConstancia"
                      checked={modalEditData.obtendraConstancia === false}
                      onChange={() => setModalEditData({ ...modalEditData, obtendraConstancia: false })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {/* Comentarios adicionales */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios adicionales
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  value={modalEditData.comentarios}
                  onChange={(e) => setModalEditData({ ...modalEditData, comentarios: e.target.value })}
                ></textarea>
              </div>
            </div>
            
            {/* Nota informativa (si es una solicitud devuelta) */}
            {modalEditData.tab === "Devueltas" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Al guardar los cambios, esta solicitud pasará de "Devueltas" a "En revisión" y 
                  aparecerá en la pestaña de Pendientes.
                </p>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setModalEditData(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close sidebar when clicking outside */}
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
