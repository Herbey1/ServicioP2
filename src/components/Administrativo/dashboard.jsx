"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Importamos los componentes
import Sidebar from "../Docente/components/Sidebar"
import MainContent from "./components/MainContent"
import ReviewSolicitudModal from "./components/ReviewSolicitudModal"
import LogoutConfirmModal from "../Docente/components/LogoutConfirmModal"

export default function AdminDashboard({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState("Pendientes")
  const [activeSection, setActiveSection] = useState("Comisiones")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalReviewData, setModalReviewData] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const navigate = useNavigate()

  const tabs = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]

  // Datos de ejemplo para solicitudes
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes: [
      {
        titulo: "Congreso Nacional de Sistemas Computacionales",
        solicitante: "Carlos Rodríguez",
        tipoParticipacion: "Ponente",
        ciudad: "Ciudad de México",
        pais: "México",
        lugar: "Centro de Convenciones",
        fechaSalida: "2023-06-15",
        fechaRegreso: "2023-06-20",
        horaSalida: "08:00",
        horaRegreso: "20:00",
        numeroPersonas: 1,
        necesitaTransporte: true,
        cantidadCombustible: 500,
        programaEducativo: "Ingeniería en Computación",
        proyectoInvestigacion: true,
        obtendraConstancia: true,
        comentarios: "Presentación de artículo científico",
        status: "En revisión"
      },
      {
        titulo: "Taller de Innovación Industrial",
        solicitante: "Ana López",
        tipoParticipacion: "Asistente",
        ciudad: "Tijuana",
        pais: "México",
        lugar: "UABC",
        fechaSalida: "2023-07-10",
        fechaRegreso: "2023-07-12",
        horaSalida: "09:00",
        horaRegreso: "18:00",
        numeroPersonas: 2,
        necesitaTransporte: false,
        cantidadCombustible: 0,
        programaEducativo: "Ingeniería Industrial",
        proyectoInvestigacion: false,
        obtendraConstancia: true,
        comentarios: "",
        status: "En revisión"
      }
    ],
    Aprobadas: [],
    Rechazadas: [],
    Devueltas: []
  })

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    setIsAuthenticated(false)
    navigate('/')
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleReviewClick = (tab, index, solicitud) => {
    setModalReviewData({ tab, index, solicitud: { ...solicitud } })
    setShowReviewModal(true)
  }

  // Función para aprobar una solicitud
  const approveRequest = (tab, index) => {
    const updatedSolicitudes = { ...solicitudesPorTab }
    const solicitud = { ...updatedSolicitudes[tab][index] }
    
    solicitud.status = "Aprobada"
    
    // Eliminar de la pestaña actual
    updatedSolicitudes[tab] = updatedSolicitudes[tab].filter((_, i) => i !== index)
    
    // Agregar a la pestaña de aprobadas
    updatedSolicitudes.Aprobadas = [...updatedSolicitudes.Aprobadas, solicitud]
    
    setSolicitudesPorTab(updatedSolicitudes)
    setShowReviewModal(false)
    setModalReviewData(null)
  }

  // Función para rechazar una solicitud
  const rejectRequest = (tab, index, comments) => {
    const updatedSolicitudes = { ...solicitudesPorTab }
    const solicitud = { ...updatedSolicitudes[tab][index] }
    
    solicitud.status = "Rechazada"
    solicitud.comentariosAdmin = comments
    
    // Eliminar de la pestaña actual
    updatedSolicitudes[tab] = updatedSolicitudes[tab].filter((_, i) => i !== index)
    
    // Agregar a la pestaña de rechazadas
    updatedSolicitudes.Rechazadas = [...updatedSolicitudes.Rechazadas, solicitud]
    
    setSolicitudesPorTab(updatedSolicitudes)
    setShowReviewModal(false)
    setModalReviewData(null)
  }

  // Función para devolver una solicitud para correcciones
  const returnRequest = (tab, index, comments) => {
    const updatedSolicitudes = { ...solicitudesPorTab }
    const solicitud = { ...updatedSolicitudes[tab][index] }
    
    solicitud.status = "Devuelta"
    solicitud.comentariosAdmin = comments
    
    // Eliminar de la pestaña actual
    updatedSolicitudes[tab] = updatedSolicitudes[tab].filter((_, i) => i !== index)
    
    // Agregar a la pestaña de devueltas
    updatedSolicitudes.Devueltas = [...updatedSolicitudes.Devueltas, solicitud]
    
    setSolicitudesPorTab(updatedSolicitudes)
    setShowReviewModal(false)
    setModalReviewData(null)
  }

  const solicitudesActivas = solicitudesPorTab[activeTab] || []

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        confirmLogout={handleLogoutClick}
      />
      
      {/* Main Content Component */}
      <MainContent 
        sidebarOpen={sidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        solicitudesActivas={solicitudesActivas}
        handleReviewClick={handleReviewClick}
      />

      {/* Modales */}
      {showReviewModal && modalReviewData && (
        <ReviewSolicitudModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setModalReviewData(null)
          }}
          solicitud={modalReviewData.solicitud}
          onApprove={() => approveRequest(modalReviewData.tab, modalReviewData.index)}
          onReject={(comments) => rejectRequest(modalReviewData.tab, modalReviewData.index, comments)}
          onReturn={(comments) => returnRequest(modalReviewData.tab, modalReviewData.index, comments)}
        />
      )}      {/* Modal de confirmación de cierre de sesión */}
      <LogoutConfirmModal
        showLogoutConfirm={showLogoutConfirm}
        cancelLogout={cancelLogout}
        handleLogout={confirmLogout}
      />
    </div>
  )
}


