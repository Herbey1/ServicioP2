"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { apiFetch } from "../../api/client"
import { useToast } from "../../context/ToastContext"

/* ── Componentes compartidos ─ */
import Sidebar            from "../Docente/components/Sidebar"
import LogoutConfirmModal from "../Docente/components/LogoutConfirmModal"
import DeleteConfirmModal from "../common/DeleteConfirmModal"
import ProfileDetailsModal from "../common/ProfileDetailsModal"

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
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [deleteModalUser, setDeleteModalUser] = useState(null)
  const [viewUserProfile, setViewUserProfile] = useState(null)

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
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'Error al obtener usuarios');
      }
      setUsuarios(resp.data?.items || []);
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

  const approveRequest = async (solicitudId, comments) => {
    try {
      const success = await changeEstado(solicitudId, 'APROBADA', comments)
      if (!success) return
      
      showToast('Solicitud aprobada correctamente', { type: 'success' })
      await loadSolicitudes()
      setActiveTabComisiones("Aprobadas")
      setModalSolicitud(null)
    } catch (error) {
      console.error('Error aprobando solicitud:', error)
      showToast('Error al aprobar la solicitud', { type: 'error' })
    }
  }

  const rejectRequest = async (solicitudId, comments) => {
    try {
      const success = await changeEstado(solicitudId, 'RECHAZADA', comments)
      if (!success) return
      
      showToast('Solicitud rechazada', { type: 'success' })
      await loadSolicitudes()
      setActiveTabComisiones("Rechazadas")
      setModalSolicitud(null)
    } catch (error) {
      console.error('Error rechazando solicitud:', error)
      showToast('Error al rechazar la solicitud', { type: 'error' })
    }
  }

  const returnRequest = async (solicitudId, comments) => {
    try {
      const success = await changeEstado(solicitudId, 'DEVUELTA', comments)
      if (!success) return
      
      showToast('Solicitud devuelta al docente para corrección', { type: 'success' })
      await loadSolicitudes()
      setActiveTabComisiones("Devueltas")
      setModalSolicitud(null)
    } catch (error) {
      console.error('Error devolviendo solicitud:', error)
      showToast('Error al devolver la solicitud', { type: 'error' })
    }
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
        await loadReportesData();
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

  const loadReportesData = async () => {
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
          descripcion: item.descripcion || '',
          // resumen historial
          ultimoCambioFecha: item.last_change_at ? new Date(item.last_change_at).toLocaleString() : undefined,
          ultimoCambioActor: item.last_change_by || undefined,
          historialCount: typeof item.hist_count === 'number' ? item.hist_count : undefined
        })
      })
      setReportesPorTab(grouped)
    } catch (e) { 
      console.error('Error recargando reportes', e)
      showToast('Error al cargar reportes', { type: 'error' })
    }
  }

  const approveReporte = async (reporteId, comments) => {
    try {
      await apiFetch(`/api/reportes/${reporteId}/estado`, {
        method: 'PATCH',
        body: { estado: 'APROBADO', motivo: comments }
      })
      showToast('Reporte aprobado correctamente', { type: 'success' })
      await loadReportesData()
      setActiveTabReportes('Aprobados')
      setModalReporte(null)
    } catch (e) {
      console.error('Error aprobando reporte', e)
      showToast('Error al aprobar el reporte', { type: 'error' })
    }
  }

  const rejectReporte = async (reporteId, comments) => {
    try {
      await apiFetch(`/api/reportes/${reporteId}/estado`, {
        method: 'PATCH',
        body: { estado: 'RECHAZADO', motivo: comments }
      })
      showToast('Reporte rechazado', { type: 'success' })
      await loadReportesData()
      setActiveTabReportes('Rechazados')
      setModalReporte(null)
    } catch (e) {
      console.error('Error rechazando reporte', e)
      showToast('Error al rechazar el reporte', { type: 'error' })
    }
  }

  const returnReporte = async (reporteId, comments) => {
    try {
      await apiFetch(`/api/reportes/${reporteId}/estado`, {
        method: 'PATCH',
        body: { estado: 'DEVUELTO', motivo: comments }
      })
      showToast('Reporte devuelto al docente para corrección', { type: 'success' })
      await loadReportesData()
      setActiveTabReportes('Devueltos')
      setModalReporte(null)
    } catch (e) {
      console.error('Error devolviendo reporte', e)
      showToast('Error al devolver el reporte', { type: 'error' })
    }
  }
  
  const handleAddDocente = async ({ nombre, correo, rol, password, telefono, departamento, categoria }) => {
    const payload = {
      nombre: (nombre || '').trim(),
      correo: (correo || '').trim(),
      rol,
      password: password?.trim(),
      telefono: (telefono || '').trim(),
      departamento: (departamento || '').trim(),
      categoria: (categoria || '').trim()
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

  const confirmPermanentDelete = (user) => {
    if (deletingUserId) return
    setDeleteModalUser(user)
  }

  const openProfileView = (user) => {
    setViewUserProfile(user)
  }

  const closeProfileView = () => setViewUserProfile(null)

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return
    const { id, nombre } = deleteModalUser
    setDeletingUserId(id)
    try {
      const resp = await apiFetch(`/api/usuarios/${id}/permanent`, { method: 'DELETE' })
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo eliminar el usuario')
      }
      showToast(`Se eliminó definitivamente a ${nombre}`, { type: 'success' })
      await loadUsuarios()
    } catch (e) {
      console.error('Error eliminando usuario', e)
      showToast(e?.message || 'No se pudo eliminar el usuario', { type: 'error' })
    } finally {
      setDeletingUserId(null)
      setDeleteModalUser(null)
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
    <div className={`full-page-container font-sans ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex min-h-screen w-full">
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
        toggleSidebar={toggleSidebar}
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
        handleDeleteUser={(userId) => {
          const user = usuarios.find((u) => u.id === userId)
          if (user) confirmPermanentDelete(user)
        }}
        handleViewUserProfile={(userId) => {
          const user = usuarios.find((u) => u.id === userId)
          if (user) openProfileView(user)
        }}
        userActionId={userActionId}
        deletingUserId={deletingUserId}
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
            approveRequest(modalSolicitud.solicitud.id, c)
          }
          onReject={(c) =>
            rejectRequest(modalSolicitud.solicitud.id, c)
          }
          onReturn={(c) =>
            returnRequest(modalSolicitud.solicitud.id, c)
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
            approveReporte(modalReporte.reporte.id, c)
          }
          onReject={(c) =>
            rejectReporte(modalReporte.reporte.id, c)
          }
          onReturn={(c) =>
            returnReporte(modalReporte.reporte.id, c)
          }
        />
      )}

      {/* Logout */}
      <LogoutConfirmModal
        showLogoutConfirm={showLogout}
        cancelLogout={hideLogoutModal}
        handleLogout={handleLogout}
      />
      <DeleteConfirmModal
        show={Boolean(deleteModalUser)}
        onCancel={() => setDeleteModalUser(null)}
        onConfirm={handleDeleteUser}
        title="Eliminar usuario"
        message={
          deleteModalUser
            ? `Esta acción eliminará definitivamente a ${deleteModalUser.nombre}. ¿Deseas continuar?`
            : "Esta acción eliminará el usuario seleccionado."
        }
        confirmLabel={deletingUserId ? "Eliminando…" : "Eliminar"}
        cancelLabel="Cancelar"
        confirmDisabled={Boolean(deletingUserId)}
        type="danger"
      />
        <ProfileDetailsModal
          open={Boolean(viewUserProfile)}
          onClose={closeProfileView}
          profile={viewUserProfile}
        />
      </div>
    </div>
  )
}
