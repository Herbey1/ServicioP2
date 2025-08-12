"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

/* Layout y navegación */
import Sidebar             from "./components/Sidebar"
import Header              from "./components/Header"
import TabSelector         from "./components/TabSelector"

/* Tarjetas */
import SolicitudCard       from "./components/SolicitudCard"
import ReportCard          from "./components/ReportCard"

/* Modales ─ Comisiones */
import CreateSolicitudModal from "./components/CreateSolicitudModal"
import EditSolicitudModal   from "./components/EditSolicitudModal"
import DeleteConfirmModal   from "./components/DeleteConfirmModal"

/* Modales ─ Reportes */
import CreateReporteModal   from "./components/CreateReporteModal"
import EditReporteModal     from "./components/EditReporteModal"

/* Perfil */
import ProfileSection      from "./components/ProfileSection"

/* Logout */
import LogoutConfirmModal  from "./components/LogoutConfirmModal"

export default function DashboardDocente({ setIsAuthenticated }) {
  /* ──────────────── Navegación y UI global ──────────────── */
  const navigate = useNavigate()
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("Comisiones") // Comisiones | Reportes | Perfil
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [showLogout,    setShowLogout]    = useState(false)

  const toggleSidebar   = () => setSidebarOpen(!sidebarOpen)
  const confirmLogout   = () => setShowLogout(true)
  const cancelLogout    = () => setShowLogout(false)
  const handleLogout = () => {
    // Si está en modo oscuro, lo cambiamos a modo claro antes de cerrar sesión
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    setIsAuthenticated(false);
    navigate("/login");
  }

  /* ──────────────── Tabs comunes ──────────────── */
  const tabsComisiones = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]
  const tabsReportes   = ["Pendientes", "Aprobados", "Rechazados", "Devueltos"]

  const [activeTabComisiones, setActiveTabComisiones] = useState("Pendientes")
  const [activeTabReportes,   setActiveTabReportes]   = useState("Pendientes")

  /* ──────────────── Estado: COMISIONES ──────────────── */
  const emptySolicitud = {
    id: "", // ID único para la comisión
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
  }

  const tiposParticipacion  = ["Ponente", "Asistente", "Organizador", "Jurado", "Otro"]
  const programasEducativos = [
    "Ingeniería Industrial",
    "Ingeniería Civil",
    "Ingeniería en Computación",
    "Ingeniería Química",
    "Ingeniería Electrónica",
    "Bioingeniería"
  ]

  const [showCreateModal,   setShowCreateModal]   = useState(false)
  const [modalEditData,     setModalEditData]     = useState(null)   // { solicitud, index, tab }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSolicitud,      setNewSolicitud]      = useState(emptySolicitud)
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes : [],
    Aprobadas  : [],
    Rechazadas : [],
    Devueltas  : []
  })

  /* CRUD Comisiones */
  const handleCreateSolicitud = () => {
    if (!newSolicitud.titulo) return alert("Completa el título.")
    
    // Generar ID único para la comisión
    const year = new Date().getFullYear()
    const count = solicitudesPorTab.Pendientes.length + 
                  solicitudesPorTab.Aprobadas.length + 
                  solicitudesPorTab.Rechazadas.length + 
                  solicitudesPorTab.Devueltas.length + 1
    const id = `COM-${year}-${count.toString().padStart(3, '0')}`
    
    setSolicitudesPorTab(prev => ({
      ...prev,
      Pendientes: [...prev.Pendientes, {...newSolicitud, id}]
    }))
    setNewSolicitud(emptySolicitud)
    setShowCreateModal(false)
    setActiveTabComisiones("Pendientes")
  }

  const handleSaveEditSolicitud = () => {
    const { tab, index, ...s } = modalEditData
    const lista = [...solicitudesPorTab[tab]]
    lista[index] = s
    setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
    setModalEditData(null)
  }

  const confirmDeleteSolicitud = () => {
    const { tab, index } = modalEditData
    const lista = [...solicitudesPorTab[tab]]
    lista.splice(index, 1)
    setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
    setShowDeleteConfirm(false)
    setModalEditData(null)
  }

  /* ──────────────── Estado: REPORTES ──────────────── */
  const emptyReporte = {
    id          : "",  // ID único para el reporte
    titulo      : "",
    solicitante : "Fernando Huerta",
    descripcion : "",
    fechaEntrega: "",
    evidencia   : null,
    status      : "En revisión"
  }

  const [showCreateReporteModal, setShowCreateReporteModal] = useState(false)
  const [modalEditReporte,       setModalEditReporte]       = useState(null) // { reporte, index, tab }
  const [nuevoReporte,           setNuevoReporte]           = useState(emptyReporte)
  const [reportesPorTab,         setReportesPorTab]         = useState({
    Pendientes : [],
    Aprobados  : [],
    Rechazados : [],
    Devueltos  : []
  })

  /* CRUD Reportes */
  const handleCreateReporte = () => {
    if (!nuevoReporte.titulo || !nuevoReporte.descripcion || !nuevoReporte.fechaEntrega)
      return alert("Completa los campos obligatorios.")
    
    // Generar ID único para el reporte
    const year = new Date().getFullYear()
    const count = reportesPorTab.Pendientes.length + 
                  reportesPorTab.Aprobados.length + 
                  reportesPorTab.Rechazados.length + 
                  reportesPorTab.Devueltos.length + 1
    const id = `REP-${year}-${count.toString().padStart(3, '0')}`
    
    setReportesPorTab(prev => ({
      ...prev,
      Pendientes: [...prev.Pendientes, {...nuevoReporte, id}]
    }))
    setNuevoReporte(emptyReporte)
    setShowCreateReporteModal(false)
    setActiveTabReportes("Pendientes")
  }

  const handleSaveEditReporte = () => {
    const { tab, index, ...r } = modalEditReporte
    const lista = [...reportesPorTab[tab]]
    lista[index] = r
    setReportesPorTab(prev => ({ ...prev, [tab]: lista }))
    setModalEditReporte(null)
  }

  const handleDeleteReporte = () => {
    const { tab, index } = modalEditReporte
    const lista = [...reportesPorTab[tab]]
    lista.splice(index, 1)
    setReportesPorTab(prev => ({ ...prev, [tab]: lista }))
    setModalEditReporte(null)
  }

  /* ──────────────── UI helpers ──────────────── */
  const statusColors = {
    "En revisión": { text: "text-yellow-700", bg: "bg-yellow-100" },
    Aprobada     : { text: "text-green-700",  bg: "bg-green-100"  },
    Aprobado     : { text: "text-green-700",  bg: "bg-green-100"  },
    Rechazada    : { text: "text-red-700",    bg: "bg-red-100"    },
    Rechazado    : { text: "text-red-700",    bg: "bg-red-100"    },
    Devuelta     : { text: "text-orange-700", bg: "bg-orange-100" },
    Devuelto     : { text: "text-orange-700", bg: "bg-orange-100" }
  }
  /* ──────────────── Listas visibles ──────────────── */
  const solicitudesActivas = solicitudesPorTab[activeTabComisiones] || []
  const reportesActivos    = reportesPorTab[activeTabReportes]     || []

  /* ──────────────── Render ──────────────── */
  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        confirmLogout={confirmLogout}
      />

      {/* Contenedor principal */}
      <div className={`flex-1 p-8 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        {/* Header (oculto en Perfil) */}
        {activeSection !== "Perfil" && (
          <Header
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setShowCreateModal={setShowCreateModal}
            setShowCreateReporteModal={setShowCreateReporteModal}
          />
        )}

        {/* Titular dinámico */}
        {activeSection !== "Perfil" && (
          <h2 className="text-2xl font-bold mb-6">
            {activeSection === "Comisiones" ? "Mis solicitudes" : "Mis reportes"}
          </h2>
        )}

        {/* ----- SECCIÓN COMISIONES ----- */}
        {activeSection === "Comisiones" && (
          <>
            <TabSelector
              tabs={tabsComisiones}
              activeTab={activeTabComisiones}
              setActiveTab={setActiveTabComisiones}
            />

            <div className="space-y-4 flex-1 overflow-y-auto">
              {solicitudesActivas.length > 0 ? (
                solicitudesActivas.map((solicitud, i) => (
                  <SolicitudCard
                    key={i}
                    solicitud={solicitud}
                    index={i}
                    statusColors={statusColors}
                    handleEditClick={() =>
                      setModalEditData({ ...solicitud, index: i, tab: activeTabComisiones })
                    }
                  />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  No hay solicitudes {activeTabComisiones.toLowerCase()}
                </p>
              )}
            </div>
          </>
        )}

        {/* ----- SECCIÓN REPORTES ----- */}
        {activeSection === "Reportes" && (
          <>
            <TabSelector
              tabs={tabsReportes}
              activeTab={activeTabReportes}
              setActiveTab={setActiveTabReportes}
            />

            <div className="space-y-4 flex-1 overflow-y-auto">
              {reportesActivos.length > 0 ? (
                reportesActivos.map((reporte, i) => (
                  <ReportCard
                    key={i}
                    reporte={reporte}
                    index={i}
                    statusColors={statusColors}
                    handleEdit={() =>
                      setModalEditReporte({ ...reporte, index: i, tab: activeTabReportes })
                    }
                  />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  No hay reportes {activeTabReportes.toLowerCase()}
                </p>
              )}
            </div>
          </>
        )}

        {/* ----- SECCIÓN PERFIL ----- */}
        {activeSection === "Perfil" && <ProfileSection />}
      </div>

      {/* ────────── Modales COMISIONES ────────── */}
      <CreateSolicitudModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newSolicitud={newSolicitud}
        setNewSolicitud={setNewSolicitud}
        handleCreateSolicitud={handleCreateSolicitud}
        tiposParticipacion={tiposParticipacion}
        programasEducativos={programasEducativos}
      />

      {modalEditData && (
        <EditSolicitudModal
          modalEditData={modalEditData}
          setModalEditData={setModalEditData}
          handleSaveEdit={handleSaveEditSolicitud}
          handleDeleteClick={() => setShowDeleteConfirm(true)}
          tiposParticipacion={tiposParticipacion}
          programasEducativos={programasEducativos}
        />
      )}

      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        cancelDelete={() => setShowDeleteConfirm(false)}
        confirmDelete={confirmDeleteSolicitud}
      />

      {/* ────────── Modales REPORTES ────────── */}
      <CreateReporteModal
        show={showCreateReporteModal}
        close={() => setShowCreateReporteModal(false)}
        nuevoReporte={nuevoReporte}
        setNuevoReporte={setNuevoReporte}
        guardarReporte={handleCreateReporte}
      />

      {modalEditReporte && (
        <EditReporteModal
          modalData={modalEditReporte}
          setModalData={setModalEditReporte}
          guardarCambios={handleSaveEditReporte}
          eliminar={handleDeleteReporte}
        />
      )}

      {/* Logout */}
      <LogoutConfirmModal
        showLogoutConfirm={showLogout}
        cancelLogout={cancelLogout}
        handleLogout={handleLogout}
      />
    </div>
  )
}
