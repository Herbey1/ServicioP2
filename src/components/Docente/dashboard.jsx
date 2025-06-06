"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Importamos los componentes
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import TabSelector from "./components/TabSelector"
import SolicitudCard from "./components/SolicitudCard"
import CreateSolicitudModal from "./components/CreateSolicitudModal"
import EditSolicitudModal from "./components/EditSolicitudModal"
import DeleteConfirmModal from "./components/DeleteConfirmModal"
import LogoutConfirmModal from "./components/LogoutConfirmModal"

export default function SolicitudesInterface({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState("Pendientes")
  const [activeSection, setActiveSection] = useState("Comisiones")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalEditData, setModalEditData] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const { tab, index } = modalEditData;
    
    // Eliminamos la solicitud del arreglo correspondiente
    const updatedList = [...solicitudesPorTab[tab]];
    updatedList.splice(index, 1);
    
    setSolicitudesPorTab({
      ...solicitudesPorTab,
      [tab]: updatedList
    });
    
    // Cerramos ambos modales
    setShowDeleteConfirm(false);
    setModalEditData(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
    return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        confirmLogout={confirmLogout}
      />
      
      {/* Main Content */}
      <div className={`flex-1 bg-white p-8 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header Component */}
        <Header 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          setShowCreateModal={setShowCreateModal}
        />

        {/* Título dinámico según la sección activa */}
        <h2 className="text-2xl font-bold mb-6">
          {activeSection === "Comisiones" ? "Mis solicitudes" : "Mis reportes"}
        </h2>

        {/* Contenido condicional según la sección */}
        {activeSection === "Comisiones" ? (
          <>
            {/* TabSelector Component */}
            <TabSelector 
              tabs={tabs} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />

            {/* Lista de Solicitudes */}
            <div className="space-y-4 flex-1 overflow-y-auto">
              {solicitudesActivas.length > 0 ? (
                solicitudesActivas.map((solicitud, index) => (
                  <SolicitudCard 
                    key={index}
                    solicitud={solicitud}
                    index={index}
                    statusColors={statusColors}
                    handleEditClick={handleEditClick}
                  />
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

      {/* Modal Components */}
      <CreateSolicitudModal 
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newSolicitud={newSolicitud}
        setNewSolicitud={setNewSolicitud}
        handleCreateSolicitud={handleCreateSolicitud}
        tiposParticipacion={tiposParticipacion}
        programasEducativos={programasEducativos}
      />

      <EditSolicitudModal
        modalEditData={modalEditData}
        setModalEditData={setModalEditData}
        handleSaveEdit={handleSaveEdit}
        handleDeleteClick={handleDeleteClick}
        tiposParticipacion={tiposParticipacion}
        programasEducativos={programasEducativos}
      />

      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
      />

      <LogoutConfirmModal
        showLogoutConfirm={showLogoutConfirm}
        cancelLogout={cancelLogout}
        handleLogout={handleLogout}
      />
    </div>
  )
}
