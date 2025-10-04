"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { apiFetch } from "../../api/client"
import { useToast } from "../../context/ToastContext"

/* ── Componentes compartidos ─ */
import Sidebar            from "../Docente/components/Sidebar"
import LogoutConfirmModal from "../Docente/components/LogoutConfirmModal"

/* ── Componentes propios ──── */
import MainContent          from "./components/MainContent"
import ReviewSolicitudModal from "./components/ReviewSolicitudModal"
import ReviewReporteModal   from "./components/ReviewReporteModal"
import AddDocenteModal      from "./components/AddDocenteModal"

export default function AdminDashboard({ setIsAuthenticated }) {
  /* ------------- UI general ------------- */
  const navigate = useNavigate()
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState("Comisiones")      // "Comisiones" | "Reportes" | "Usuarios"
  const tabsComisiones = ["Pendientes", "Aprobadas", "Rechazadas", "Devueltas"]
  const tabsReportes   = ["Pendientes", "Aprobados", "Rechazados", "Devueltos"]
  const [activeTabComisiones, setActiveTabComisiones] = useState("Pendientes")
  const [activeTabReportes,   setActiveTabReportes]   = useState("Pendientes")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogout,  setShowLogout]  = useState(false)
  const [showAddDocente, setShowAddDocente] = useState(false)
  const [addingDocente, setAddingDocente] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [userActionId, setUserActionId] = useState(null)

  /* ------------- COMISIONES ------------- */
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes: [],
    Aprobadas: [],
    Rechazadas: [],
    Devueltas: []
  })
  const [modalSolicitud, setModalSolicitud] = useState(null) // { tab, index, solicitud }
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)

  const loadSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true)
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
          status: map.status,
          // Resumen de historial
          ultimoCambioFecha: item.last_change_at ? new Date(item.last_change_at).toLocaleString() : undefined,
          ultimoCambioActor: item.last_change_by || undefined,
          historialCount: typeof item.hist_count === 'number' ? item.hist_count : undefined
        });
      });
      setSolicitudesPorTab(grouped);
    } catch (e) {
      console.error('Error cargando solicitudes', e);
      showToast('No se pudieron cargar solicitudes', { type: 'error' })
    } finally {
      setLoadingSolicitudes(false)
    }
  }
  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const resp = await apiFetch('/api/usuarios');
      setUsuarios(resp.items || []);
    } catch (e) {
      console.error('Error cargando usuarios', e);
      showToast('No se pudieron cargar los usuarios', { type: 'error' });
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'Usuarios') {
      loadUsuarios();
    }
  }, [activeSection]);

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
      showToast('No se pudo cambiar el estado', { type: 'error' })
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
  const [loadingReportes, setLoadingReportes] = useState(false)

  useEffect(() => {
    async function loadReportes() {
      try {
        setLoadingReportes(true)
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
            descripcion: item.descripcion || "",
            // resumen historial
            ultimoCambioFecha: item.last_change_at ? new Date(item.last_change_at).toLocaleString() : undefined,
            ultimoCambioActor: item.last_change_by || undefined,
            historialCount: typeof item.hist_count === 'number' ? item.hist_count : undefined
          });
        });
        setReportesPorTab(grouped);
      } catch (e) {
        console.error('Error cargando reportes', e);
        showToast('No se pudieron cargar reportes', { type: 'error' })
      } finally {
        setLoadingReportes(false)
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

  const approveReporte = async (tab, index, comments) => {
    try {
      const r = reportesPorTab[tab][index]
      await apiFetch(`/api/reportes/${r.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'APROBADO', motivo: comments }
      })
      // Recargar desde API para reflejar cambios y mantener consistencia
      await (async function reload() {
        try {
          const resp = await apiFetch('/api/reportes')
          const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] }
          const estadoMap = {
            EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
            APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
            RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
            DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
          }
          ;(resp.items || []).forEach(item => {
            const map = estadoMap[item.estado] || estadoMap.EN_REVISION
            grouped[map.tab].push({
              id: item.id,
              titulo: item.asunto || 'Reporte de Comisión',
              solicitante: item.usuarios?.nombre || item.docente_id,
              fechaEntrega: item.fecha_entrega?.slice(0,10) || 'N/A',
              status: map.status,
              descripcion: item.descripcion || ''
            })
          })
          setReportesPorTab(grouped)
        } catch (e) { console.error('Error recargando reportes', e) }
      })()
      setActiveTabReportes('Aprobados')
    } catch (e) {
      console.error('Error aprobando reporte', e)
    }
  }

  const rejectReporte = async (tab, index, comments) => {
    try {
      const r = reportesPorTab[tab][index]
      await apiFetch(`/api/reportes/${r.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'RECHAZADO', motivo: comments }
      })
      await (async function reload() {
        try {
          const resp = await apiFetch('/api/reportes')
          const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] }
          const estadoMap = {
            EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
            APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
            RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
            DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
          }
          ;(resp.items || []).forEach(item => {
            const map = estadoMap[item.estado] || estadoMap.EN_REVISION
            grouped[map.tab].push({
              id: item.id,
              titulo: item.asunto || 'Reporte de Comisión',
              solicitante: item.usuarios?.nombre || item.docente_id,
              fechaEntrega: item.fecha_entrega?.slice(0,10) || 'N/A',
              status: map.status,
              descripcion: item.descripcion || ''
            })
          })
          setReportesPorTab(grouped)
        } catch (e) { console.error('Error recargando reportes', e) }
      })()
      setActiveTabReportes('Rechazados')
    } catch (e) {
      console.error('Error rechazando reporte', e)
    }
  }

  const returnReporte = async (tab, index, comments) => {
    try {
      const r = reportesPorTab[tab][index]
      await apiFetch(`/api/reportes/${r.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'DEVUELTO', motivo: comments }
      })
      await (async function reload() {
        try {
          const resp = await apiFetch('/api/reportes')
          const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] }
          const estadoMap = {
            EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
            APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
            RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
            DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
          }
          ;(resp.items || []).forEach(item => {
            const map = estadoMap[item.estado] || estadoMap.EN_REVISION
            grouped[map.tab].push({
              id: item.id,
              titulo: item.asunto || 'Reporte de Comisión',
              solicitante: item.usuarios?.nombre || item.docente_id,
              fechaEntrega: item.fecha_entrega?.slice(0,10) || 'N/A',
              status: map.status,
              descripcion: item.descripcion || ''
            })
          })
          setReportesPorTab(grouped)
        } catch (e) { console.error('Error recargando reportes', e) }
      })()
      setActiveTabReportes('Devueltos')
    } catch (e) {
      console.error('Error devolviendo reporte', e)
    }
  }
  
  const handleAddDocente = async ({ nombre, correo, rol, password }) => {
    const payload = {
      nombre: (nombre || '').trim(),
      correo: (correo || '').trim(),
      rol,
      password: password?.trim()
    }
    if (!payload.nombre || !payload.correo || !payload.password) return

    try {
      setAddingDocente(true)
      const resp = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: payload
      })
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo crear el usuario')
      }
      showToast('Usuario agregado correctamente', { type: 'success' })
      setShowAddDocente(false)
      await loadUsuarios()
    } catch (e) {
      console.error('Error agregando usuario', e)
      showToast(e?.message || 'No se pudo agregar el usuario', { type: 'error' })
    } finally {
      setAddingDocente(false)
    }
  }

  const handleChangeUserRole = async (userId, nextRole) => {
    setUserActionId(userId)
    try {
      const resp = await apiFetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        body: { rol: nextRole }
      })
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo actualizar el rol')
      }
      showToast('Rol actualizado', { type: 'success' })
      await loadUsuarios()
    } catch (e) {
      console.error('Error actualizando rol', e)
      showToast(e?.message || 'No se pudo actualizar el rol', { type: 'error' })
    } finally {
      setUserActionId(null)
    }
  }

  const handleToggleUserActive = async (userId, shouldActivate) => {
    setUserActionId(userId)
    try {
      const resp = shouldActivate
        ? await apiFetch(`/api/usuarios/${userId}`, {
            method: 'PATCH',
            body: { activo: true }
          })
        : await apiFetch(`/api/usuarios/${userId}`, {
            method: 'DELETE'
          })

      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo actualizar el usuario')
      }

      showToast(shouldActivate ? 'Usuario reactivado' : 'Usuario deshabilitado', { type: 'success' })
      await loadUsuarios()
    } catch (e) {
      console.error('Error cambiando estado de usuario', e)
      showToast(e?.message || 'No se pudo actualizar el usuario', { type: 'error' })
    } finally {
      setUserActionId(null)
    }
  }

  const closeAddDocente = () => {
    if (addingDocente) return
    setShowAddDocente(false)
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
        extraItems={[{ label: 'Usuarios', key: 'Usuarios' }]}
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
        onAddDocenteClick={() => setShowAddDocente(true)}
        disableAddDocenteButton={addingDocente}
        solicitudesActivas={solicitudesActivas}
        reportesActivos={reportesActivos}
        loadingSolicitudes={loadingSolicitudes}
        loadingReportes={loadingReportes}
        loadingUsuarios={loadingUsuarios}
        usuarios={usuarios}
        counts={
          activeSection === 'Comisiones'
            ? {
                Pendientes: solicitudesPorTab.Pendientes.length,
                Aprobadas: solicitudesPorTab.Aprobadas.length,
                Rechazadas: solicitudesPorTab.Rechazadas.length,
                Devueltas: solicitudesPorTab.Devueltas.length,
              }
            : activeSection === 'Reportes'
            ? {
                Pendientes: reportesPorTab.Pendientes.length,
                Aprobados: reportesPorTab.Aprobados.length,
                Rechazados: reportesPorTab.Rechazados.length,
                Devueltos: reportesPorTab.Devueltos.length,
              }
            : {}
        }
        handleReviewSolicitud={handleReviewSolicitud}
        handleReviewReporte={handleReviewReporte}
        handleChangeUserRole={handleChangeUserRole}
        handleToggleUserActive={handleToggleUserActive}
        userActionId={userActionId}
      />

      <AddDocenteModal
        isOpen={showAddDocente}
        onClose={closeAddDocente}
        onSubmit={handleAddDocente}
        submitting={addingDocente}
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
