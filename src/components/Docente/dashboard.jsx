"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

/* Componentes compartidos */
import Sidebar              from "./components/Sidebar"
import Header               from "./components/Header"
import TabSelector          from "./components/TabSelector"
import SolicitudCard        from "./components/SolicitudCard"
import ReportCard           from "./components/ReportCard"

/* Modales COMISIONES */
import CreateSolicitudModal from "./components/CreateSolicitudModal"
import EditSolicitudModal   from "./components/EditSolicitudModal"
import DeleteConfirmModal   from "./components/DeleteConfirmModal"

/* Modales REPORTES */
import CreateReporteModal   from "./components/CreateReporteModal"
import EditReporteModal     from "./components/EditReporteModal"

/* Modal logout */
import LogoutConfirmModal   from "./components/LogoutConfirmModal"

export default function SolicitudesInterface({ setIsAuthenticated }) {
  /* ─────── Estados globales ─────── */
  const [activeSection , setActiveSection ] = useState("Comisiones")   // Comisiones | Reportes
  const [sidebarOpen   , setSidebarOpen   ] = useState(false)
  const [showLogout    , setShowLogout    ] = useState(false)
  const navigate = useNavigate()

  /* ─────── Tabs ─────── */
  const tabsComisiones = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]
  const tabsReportes   = ["Pendientes", "Aprobados", "Rechazados", "Devueltos"]

  const [activeTabComisiones, setActiveTabComisiones] = useState("Pendientes")
  const [activeTabReportes  , setActiveTabReportes  ] = useState("Pendientes")

  /* ─────── COMISIONES ─────── */
  const [showCreateModal   , setShowCreateModal   ] = useState(false)
  const [modalEditData     , setModalEditData     ] = useState(null)
  const [showDeleteConfirm , setShowDeleteConfirm ] = useState(false)

  /* Catálogos */
  const tiposParticipacion  = ["Ponente", "Asistente", "Organizador", "Jurado", "Otro"]
  const programasEducativos = [
    "Ingeniería Industrial", "Ingeniería Civil", "Ingeniería en Computación",
    "Ingeniería Química", "Ingeniería Electrónica", "Bioingeniería"
  ]

  const emptySolicitud = {
    titulo: "",
    solicitante: "Fernando Huerta",
    tipoParticipacion: "Asistente",
    ciudad: "", pais: "", lugar: "",
    fechaSalida: "", fechaRegreso: "",
    horaSalida: "", horaRegreso: "",
    numeroPersonas: 1,
    necesitaTransporte: false,
    cantidadCombustible: 0,
    programaEducativo: "Ingeniería en Computación",
    proyectoInvestigacion: false,
    obtendraConstancia: true,
    comentarios: "",
    status: "En revisión"
  }
  const [newSolicitud, setNewSolicitud] = useState(emptySolicitud)

  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes : [],
    Aprobadas  : [],
    Rechazadas : [],
    Devueltas  : []
  })

  /* ─────── REPORTES ─────── */
  const [showCreateReporteModal, setShowCreateReporteModal] = useState(false)
  const [modalEditReporte     , setModalEditReporte     ] = useState(null)

  const emptyReporte = {
    titulo: "",
    solicitante: "Fernando Huerta",
    descripcion: "",
    fechaEntrega: "",
    evidencia: null,
    status: "En revisión"
  }
  const [nuevoReporte, setNuevoReporte] = useState(emptyReporte)

  const [reportesPorTab, setReportesPorTab] = useState({
    Pendientes : [],
    Aprobados  : [],
    Rechazados : [],
    Devueltos  : []
  })

  /* ─────── Utilidades de UI (colores por estado) ─────── */
  const statusColors = {
    "En revisión"          : { text: "text-yellow-700", bg: "bg-yellow-100" },
    "Requiere correcciones": { text: "text-orange-700", bg: "bg-orange-100" },
    Aprobada               : { text: "text-green-700",  bg: "bg-green-100" },
    Aprobado               : { text: "text-green-700",  bg: "bg-green-100" },
    Rechazada              : { text: "text-red-700",    bg: "bg-red-100"  },
    Rechazado              : { text: "text-red-700",    bg: "bg-red-100"  },
    Devuelta               : { text: "text-orange-700", bg: "bg-orange-100" },
    Devuelto               : { text: "text-orange-700", bg: "bg-orange-100" }
  }

  /* ─────── Handlers de navegación global ─────── */
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const confirmLogout = () => setShowLogout(true)
  const cancelLogout  = () => setShowLogout(false)
  const handleLogout  = () => {
    setIsAuthenticated(false)
    navigate("/login")
  }

  /* ─────── CRUD COMISIONES ─────── */
  const handleEditClickSolicitud = (solicitud, index) =>
    setModalEditData({ ...solicitud, index, tab: activeTabComisiones })

  const handleSaveEditSolicitud = () => {
    const { tab, index, ...rest } = modalEditData
    const updatedSolicitud = { ...rest, status: "En revisión" }

    if (tab === "Devueltas") {
      setSolicitudesPorTab(prev => ({
        ...prev,
        Devueltas : prev.Devueltas.filter((_, i) => i !== index),
        Pendientes: [...prev.Pendientes, updatedSolicitud]
      }))
      setActiveTabComisiones("Pendientes")
    } else {
      const lista = [...solicitudesPorTab[tab]]
      lista[index] = updatedSolicitud
      setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
    }
    setModalEditData(null)
  }

  const handleCreateSolicitud = () => {
    if (!newSolicitud.titulo || !newSolicitud.ciudad || !newSolicitud.pais ||
        !newSolicitud.lugar || !newSolicitud.fechaSalida || !newSolicitud.fechaRegreso) {
      alert("Por favor completa todos los campos obligatorios"); return
    }
    setSolicitudesPorTab(prev => ({
      ...prev,
      Pendientes: [...prev.Pendientes, newSolicitud]
    }))
    setActiveTabComisiones("Pendientes")
    setNewSolicitud(emptySolicitud)
    setShowCreateModal(false)
  }

  const handleDeleteSolicitud = () => setShowDeleteConfirm(true)

  const confirmDeleteSolicitud = () => {
    const { tab, index } = modalEditData
    const lista = [...solicitudesPorTab[tab]]
    lista.splice(index, 1)
    setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
    setShowDeleteConfirm(false)
    setModalEditData(null)
  }

  /* ─────── CRUD REPORTES ─────── */
  const handleCreateReporte = () => {
    if (!nuevoReporte.titulo || !nuevoReporte.descripcion || !nuevoReporte.fechaEntrega) {
      alert("Completa todos los campos obligatorios"); return
    }
    setReportesPorTab(prev => ({
      ...prev,
      Pendientes: [...prev.Pendientes, nuevoReporte]
    }))
    setActiveTabReportes("Pendientes")
    setNuevoReporte(emptyReporte)
    setShowCreateReporteModal(false)
  }

  const handleEditReporte = (reporte, index) =>
    setModalEditReporte({ ...reporte, index, tab: activeTabReportes })

  const handleSaveReporte = () => {
    const { tab, index, ...rest } = modalEditReporte
    const actualizado = { ...rest, status: "En revisión" }

    if (tab === "Devueltos") {
      setReportesPorTab(prev => ({
        ...prev,
        Devueltos : prev.Devueltos.filter((_, i) => i !== index),
        Pendientes: [...prev.Pendientes, actualizado]
      }))
      setActiveTabReportes("Pendientes")
    } else {
      const lista = [...reportesPorTab[tab]]
      lista[index] = actualizado
      setReportesPorTab(prev => ({ ...prev, [tab]: lista }))
    }
    setModalEditReporte(null)
  }

  const handleDeleteReporte = () => {
    const { tab, index } = modalEditReporte
    const lista = [...reportesPorTab[tab]]
    lista.splice(index, 1)
    setReportesPorTab(prev => ({ ...prev, [tab]: lista }))
    setModalEditReporte(null)
  }

  /* ─────── Listas activas ─────── */
  const solicitudesActivas = solicitudesPorTab[activeTabComisiones] || []
  const reportesActivos    = reportesPorTab[activeTabReportes]      || []

  /* ─────── Render ─────── */
  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        confirmLogout={confirmLogout}
      />

      {/* Contenido */}
      <div
        className={`flex-1 bg-white p-8 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setShowCreateModal={setShowCreateModal}
          setShowCreateReporteModal={setShowCreateReporteModal}
        />

        {/* Título */}
        <h2 className="text-2xl font-bold mb-6">
          {activeSection === "Comisiones" ? "Mis solicitudes" : "Mis reportes"}
        </h2>

        {/* Sección COMISIONES */}
        {activeSection === "Comisiones" ? (
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
                    handleEditClick={handleEditClickSolicitud}
                  />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  No hay solicitudes {activeTabComisiones.toLowerCase()}
                </p>
              )}
            </div>
          </>
        ) : (
          /* Sección REPORTES */
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
                    handleEdit={handleEditReporte}
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
      </div>

      {/* ─────── Modales COMISIONES ─────── */}
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
        handleSaveEdit={handleSaveEditSolicitud}
        handleDeleteClick={handleDeleteSolicitud}
        tiposParticipacion={tiposParticipacion}
        programasEducativos={programasEducativos}
      />

      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        cancelDelete={() => setShowDeleteConfirm(false)}
        confirmDelete={confirmDeleteSolicitud}
      />

      {/* ─────── Modales REPORTES ─────── */}
      <CreateReporteModal
        show={showCreateReporteModal}
        close={() => setShowCreateReporteModal(false)}
        nuevoReporte={nuevoReporte}
        setNuevoReporte={setNuevoReporte}
        guardarReporte={handleCreateReporte}
      />

      <EditReporteModal
        modalData={modalEditReporte}
        setModalData={setModalEditReporte}
        guardarCambios={handleSaveReporte}
        eliminar={handleDeleteReporte}
      />

      {/* Logout */}
      <LogoutConfirmModal
        showLogoutConfirm={showLogout}
        cancelLogout={cancelLogout}
        handleLogout={handleLogout}
      />
    </div>
  )
}
