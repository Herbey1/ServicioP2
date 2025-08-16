"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

/* ── Componentes compartidos ─ */
import Sidebar            from "../Docente/components/Sidebar"
import LogoutConfirmModal from "../Docente/components/LogoutConfirmModal"

/* ── Componentes propios ──── */
import MainContent          from "./components/MainContent"
import ReviewSolicitudModal from "./components/ReviewSolicitudModal"
import ReviewReporteModal   from "./components/ReviewReporteModal"

export default function AdminDashboard({ setIsAuthenticated }) {
  /* ------------- UI general ------------- */
  const navigate = useNavigate()
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("Comisiones")      // "Comisiones" | "Reportes"
  const tabsComisiones = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]
  const tabsReportes   = ["Pendientes", "Aprobados", "Rechazados", "Devueltos"]
  const [activeTabComisiones, setActiveTabComisiones] = useState("Pendientes")
  const [activeTabReportes,   setActiveTabReportes]   = useState("Pendientes")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogout,  setShowLogout]  = useState(false)

  /* ------------- COMISIONES ------------- */
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes: [
      {
        titulo    : "Congreso Nacional de Ingeniería",
        solicitante: "María Pérez",
        tipoParticipacion: "Ponente",
        fechaSalida : "2025-07-02",
        fechaRegreso: "2025-07-06",
        ciudad : "Monterrey",
        pais   : "México",
        status : "En revisión"
      }
    ],
    Aprobadas: [],
    Rechazadas: [],
    Devueltas : []
  })
  const [modalSolicitud, setModalSolicitud] = useState(null) // { tab, index, solicitud }

  const handleReviewSolicitud = (tab, index, solicitud) =>
    setModalSolicitud({ tab, index, solicitud: { ...solicitud } })

  const moveSolicitud = (from, to, index, extra = {}) => {
    setSolicitudesPorTab(prev => {
      const data = { ...prev }
      const item = { ...data[from][index], ...extra }
      data[from] = data[from].filter((_, i) => i !== index)
      data[to]   = [...data[to], item]
      return data
    })
  }

  const approveRequest = (tab, index, comments) => {
    moveSolicitud(tab, "Aprobadas", index, {
      status: "Aprobada",
      ...(comments ? { comentariosAdmin: comments } : {})
    })
    setActiveTabComisiones("Aprobadas")
  }

  const rejectRequest = (tab, index, comments) => {
    moveSolicitud(tab, "Rechazadas", index, {
      status: "Rechazada",
      comentariosAdmin: comments
    })
    setActiveTabComisiones("Rechazadas")
  }

  const returnRequest = (tab, index, comments) => {
    moveSolicitud(tab, "Devueltas", index, {
      status: "Devuelta",
      comentariosAdmin: comments
    })
    setActiveTabComisiones("Devueltas")
  }

  /* ------------- REPORTES ------------- */
  const [reportesPorTab, setReportesPorTab] = useState({
    Pendientes: [
      {
        titulo      : "Informe Congreso de Sistemas Computacionales",
        solicitante : "Carlos Rodríguez",
        descripcion : "Se presentó un artículo sobre IA aplicada a robótica.",
        fechaEntrega: "2025-06-25",
        evidencia   : null,
        status      : "En revisión"
      }
    ],
    Aprobados : [],
    Rechazados: [],
    Devueltos : []
  })
  const [modalReporte, setModalReporte] = useState(null) // { tab, index, reporte }

  const handleReviewReporte = (tab, index, reporte) =>
    setModalReporte({ tab, index, reporte: { ...reporte } })

  const moveReporte = (from, to, index, extra = {}) => {
    setReportesPorTab(prev => {
      const data = { ...prev }
      const item = { ...data[from][index], ...extra }
      data[from] = data[from].filter((_, i) => i !== index)
      data[to]   = [...data[to], item]
      return data
    })
  }

  const approveReporte = (tab, index, comments) => {
    moveReporte(tab, "Aprobados", index, {
      status: "Aprobado",
      ...(comments ? { comentariosAdmin: comments } : {})
    })
    setActiveTabReportes("Aprobados")
  }

  const rejectReporte = (tab, index, comments) => {
    moveReporte(tab, "Rechazados", index, {
      status: "Rechazado",
      comentariosAdmin: comments
    })
    setActiveTabReportes("Rechazados")
  }

  const returnReporte = (tab, index, comments) => {
    moveReporte(tab, "Devueltos", index, {
      status: "Devuelto",
      comentariosAdmin: comments
    })
    setActiveTabReportes("Devueltos")
  }
  /* ------------- Auxiliares UI ------------- */  const toggleSidebar   = () => setSidebarOpen(!sidebarOpen)
  const showLogoutModal = () => setShowLogout(true)
  const hideLogoutModal = () => setShowLogout(false)
  const handleLogout    = () => {
    // Si está en modo oscuro, lo cambiamos a modo claro antes de cerrar sesión
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    setIsAuthenticated(false)
    navigate("/login")
  }
  /* Listas visibles */
  const solicitudesActivas = solicitudesPorTab[activeTabComisiones] || []
  const reportesActivos    = reportesPorTab[activeTabReportes]     || []

  /* ------------- Render ------------- */
  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        confirmLogout={showLogoutModal}
        showProfile={false}
      />

      <MainContent
        sidebarOpen={sidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeTab={
          activeSection === "Comisiones" ? activeTabComisiones : activeTabReportes
        }
        setActiveTab={
          activeSection === "Comisiones"
            ? setActiveTabComisiones
            : setActiveTabReportes
        }
        tabs={activeSection === "Comisiones" ? tabsComisiones : tabsReportes}
        solicitudesActivas={solicitudesActivas}
        reportesActivos={reportesActivos}
        handleReviewSolicitud={handleReviewSolicitud}
        handleReviewReporte={handleReviewReporte}
      />

      {/* Modal SOLICITUD */}
      {modalSolicitud && (
        <ReviewSolicitudModal
          isOpen
          onClose={() => setModalSolicitud(null)}
          solicitud={modalSolicitud.solicitud}
          onApprove={(c) =>
            approveRequest(modalSolicitud.tab, modalSolicitud.index, c)
          }
          onReject={(c) =>
            rejectRequest(modalSolicitud.tab, modalSolicitud.index, c)
          }
          onReturn={(c) =>
            returnRequest(modalSolicitud.tab, modalSolicitud.index, c)
          }
        />
      )}

      {/* Modal REPORTE */}
      {modalReporte && (
        <ReviewReporteModal
          isOpen
          onClose={() => setModalReporte(null)}
          reporte={modalReporte.reporte}
          onApprove={(c) =>
            approveReporte(modalReporte.tab, modalReporte.index, c)
          }
          onReject={(c) =>
            rejectReporte(modalReporte.tab, modalReporte.index, c)
          }
          onReturn={(c) =>
            returnReporte(modalReporte.tab, modalReporte.index, c)
          }
        />
      )}

      {/* Logout */}
      <LogoutConfirmModal
        showLogoutConfirm={showLogout}
        cancelLogout={hideLogoutModal}
        handleLogout={handleLogout}
      />
    </div>
  )
}
