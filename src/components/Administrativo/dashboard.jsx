"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { apiFetch } from "../../api/client"

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
    Pendientes: [],
    Aprobadas: [],
    Rechazadas: [],
    Devueltas: []
  })
  const [modalSolicitud, setModalSolicitud] = useState(null) // { tab, index, solicitud }

  const loadSolicitudes = async () => {
    try {
      const resp = await apiFetch('/api/solicitudes');
      const grouped = { Pendientes: [], Aprobadas: [], Rechazadas: [], Devueltas: [] };
      const estadoMap = {
        EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
        APROBADA: { tab: 'Aprobadas', status: 'Aprobada' },
        RECHAZADA: { tab: 'Rechazadas', status: 'Rechazada' },
        DEVUELTA: { tab: 'Devueltas', status: 'Devuelta' }
      };
      (resp.items || []).forEach(item => {
        const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
        grouped[map.tab].push({
          id: item.id,
          titulo: item.asunto,
          solicitante: item.usuarios?.nombre || item.docente_id,
          fechaSalida: item.fecha_salida?.slice(0,10),
          status: map.status
        });
      });
      setSolicitudesPorTab(grouped);
    } catch (e) {
      console.error('Error cargando solicitudes', e);
    }
  }
  useEffect(() => {
    loadSolicitudes();
  }, []);

  const handleReviewSolicitud = (tab, index, solicitud) =>
    setModalSolicitud({ tab, index, solicitud: { ...solicitud } })

  const changeEstado = async (id, estado, motivo) => {
    try {
      await apiFetch(`/api/solicitudes/${id}/estado`, {
        method: 'PATCH',
        body: { estado, motivo }
      })
      return true
    } catch (e) {
      console.error('Error cambiando estado', e)
      return false
    }
  }

  const approveRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    if (!await changeEstado(sol.id, 'APROBADA', comments)) return
    await loadSolicitudes()
    setActiveTabComisiones("Aprobadas")
  }

  const rejectRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    if (!await changeEstado(sol.id, 'RECHAZADA', comments)) return
    moveSolicitud(tab, "Rechazadas", index, {
      status: "Rechazada",
      comentariosAdmin: comments
    })
    setActiveTabComisiones("Rechazadas")
  }

  const returnRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    if (!await changeEstado(sol.id, 'DEVUELTA', comments)) return
    moveSolicitud(tab, "Devueltas", index, {
      status: "Devuelta",
      comentariosAdmin: comments
    })
    setActiveTabComisiones("Devueltas")
  }

  /* ------------- REPORTES ------------- */
  const [reportesPorTab, setReportesPorTab] = useState({
    Pendientes: [],
    Aprobados : [],
    Rechazados: [],
    Devueltos: []
  })
  const [modalReporte, setModalReporte] = useState(null) // { tab, index, reporte }

  useEffect(() => {
    async function loadReportes() {
      try {
        // Asumiendo que tienes un endpoint /api/reportes
        const resp = await apiFetch('/api/reportes'); 
        const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] };

        // Mapeo de estados de la base de datos a las pestañas de la UI
        const estadoMap = {
          EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
          APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
          RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' }, // Asegúrate que este estado exista en tu enum de reportes
          DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
        };
        
        (resp.items || []).forEach(item => {
          // Asegúrate que 'item.estado' y 'item.usuarios.nombre' existan en la respuesta de tu API
          const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
          grouped[map.tab].push({
            id: item.id,
            titulo: item.asunto || "Reporte de Comisión", // Ajusta según el campo correcto
            solicitante: item.usuarios?.nombre || item.docente_id,
            fechaEntrega: item.fecha_entrega?.slice(0,10) || "N/A",
            status: map.status,
            descripcion: item.descripcion || ""
          });
        });
        setReportesPorTab(grouped);
      } catch (e) {
        console.error('Error cargando reportes', e);
      }
    }
    loadReportes();
  }, []);

  const handleReviewReporte = (tab, index, reporte) =>
    setModalReporte({ tab, index, reporte: { ...reporte } })

  const moveSolicitud = (from, to, index, extra = {}) => {
    setSolicitudesPorTab(prev => {
      const data = { ...prev }
      const item = { ...data[from][index], ...extra }
      data[from] = data[from].filter((_, i) => i !== index)
      data[to]   = [...data[to], item]
      return data
    })
  }

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
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
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
