"use client"

import { useState, useEffect, useCallback } from "react"
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

const isDateInRange = (value, { desde, hasta }) => {
  if (!desde && !hasta) return true;
  if (!value) return false;
  if (desde && value < desde) return false;
  if (hasta && value > hasta) return false;
  return true;
};

const mapSolicitudItem = (item) => {
  const estadoMap = {
    EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
    APROBADA: { tab: 'Aprobadas', status: 'Aprobada' },
    RECHAZADA: { tab: 'Rechazadas', status: 'Rechazada' },
    DEVUELTA: { tab: 'Devueltas', status: 'Devuelta' }
  };
  const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
  return {
    id: item.id,
    titulo: item.asunto,
    solicitante: item.usuarios?.nombre || item.docente_id,
    fechaSalida: item.fecha_salida?.slice(0,10) || "",
    status: map.status,
    tab: map.tab,
    ultimoCambioFecha: item.last_change_at ? new Date(item.last_change_at).toLocaleString() : undefined,
    ultimoCambioActor: item.last_change_by || undefined,
    historialCount: typeof item.hist_count === 'number' ? item.hist_count : undefined
  };
};

const mapReporteItem = (item) => {
  const estadoMap = {
    EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
    APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
    RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
    DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
  };
  const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
  return {
    id: item.id,
    titulo: item.asunto || "Reporte de Comisión",
    solicitante: item.usuarios?.nombre || item.docente_id,
    fechaEntrega: item.fecha_entrega?.slice(0,10) || "",
    status: map.status,
    descripcion: item.descripcion || "",
    tab: map.tab,
    ultimoCambioFecha: item.last_change_at ? new Date(item.last_change_at).toLocaleString() : undefined,
    ultimoCambioActor: item.last_change_by || undefined,
    historialCount: typeof item.hist_count === 'number' ? item.hist_count : undefined
  };
};

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

  /* ------------- COMISIONES ------------- */
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes: [],
    Aprobadas: [],
    Rechazadas: [],
    Devueltas: []
  })
  const [modalSolicitud, setModalSolicitud] = useState(null) // { tab, index, solicitud }
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  const [solicitudSearch, setSolicitudSearch] = useState("")
  const [reporteSearch, setReporteSearch] = useState("")
  const [solicitudFilters, setSolicitudFilters] = useState({ desde: "", hasta: "" })
  const [reporteFilters, setReporteFilters] = useState({ desde: "", hasta: "" })

  const loadSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true)
      const resp = await apiFetch('/api/solicitudes');
      const grouped = { Pendientes: [], Aprobadas: [], Rechazadas: [], Devueltas: [] };
      const items = Array.isArray(resp?.data?.items) ? resp.data.items : [];
      items.forEach(item => {
        const mapped = mapSolicitudItem(item);
        grouped[mapped.tab].push(mapped);
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
      const resp = await apiFetch(`/api/solicitudes/${id}/estado`, {
        method: 'PATCH',
        body: { estado, motivo }
      })
      if (resp && resp.ok) {
        // Notificar a otras pestañas en el mismo navegador que hubo un cambio
        try { localStorage.setItem('sgca_solicitudes_update', Date.now().toString()); } catch (e) { /* noop */ }
        return true
      }
      // Mostrar mensaje de error detallado si el servidor lo proporciona
      console.error('Error cambiando estado, respuesta no OK', resp)
      const msg = resp?.data?.msg || resp?.data?.message || `Error: ${resp?.status || 'unknown'}`;
      showToast(msg || 'No se pudo cambiar el estado', { type: 'error' })
      return false
    } catch (e) {
      console.error('Error cambiando estado', e)
      showToast('No se pudo cambiar el estado', { type: 'error' })
      return false
    }
  }

  // Obtener estado actual del recurso para validar antes de transicionar
  const getSolicitudEstado = async (id) => {
    try {
      const resp = await apiFetch(`/api/solicitudes/${id}`);
      if (!resp.ok) return { ok: false };
      return { ok: true, estado: resp?.data?.estado };
    } catch (e) {
      return { ok: false };
    }
  }

  const approveRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    const current = await getSolicitudEstado(sol.id)
    if (!current.ok) {
      await loadSolicitudes()
      showToast('No se pudo verificar el estado actual', { type: 'error' })
      return
    }
    if (current.estado && current.estado !== 'EN_REVISION') {
      await loadSolicitudes()
      showToast(`No se puede aprobar: estado actual = ${current.estado}`, { type: 'error' })
      return
    }
    if (!await changeEstado(sol.id, 'APROBADA', comments)) {
      await loadSolicitudes()
      return
    }
    await loadSolicitudes()
    setActiveTabComisiones("Aprobadas")
  }

  const rejectRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    const current = await getSolicitudEstado(sol.id)
    if (!current.ok) {
      await loadSolicitudes()
      showToast('No se pudo verificar el estado actual', { type: 'error' })
      return
    }
    if (current.estado && current.estado !== 'EN_REVISION') {
      await loadSolicitudes()
      showToast(`No se puede rechazar: estado actual = ${current.estado}`, { type: 'error' })
      return
    }
    if (!await changeEstado(sol.id, 'RECHAZADA', comments)) {
      await loadSolicitudes()
      return
    }
    moveSolicitud(tab, "Rechazadas", index, {
      status: "Rechazada",
      comentariosAdmin: comments
    })
    setActiveTabComisiones("Rechazadas")
  }

  const returnRequest = async (tab, index, comments) => {
    const sol = solicitudesPorTab[tab][index]
    const current = await getSolicitudEstado(sol.id)
    if (!current.ok) {
      await loadSolicitudes()
      showToast('No se pudo verificar el estado actual', { type: 'error' })
      return
    }
    if (current.estado && current.estado !== 'EN_REVISION') {
      await loadSolicitudes()
      showToast(`No se puede devolver: estado actual = ${current.estado}`, { type: 'error' })
      return
    }
    if (!await changeEstado(sol.id, 'DEVUELTA', comments)) {
      await loadSolicitudes()
      return
    }
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

  const loadReportes = useCallback(async () => {
    try {
      setLoadingReportes(true)
      const resp = await apiFetch('/api/reportes'); 
      const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] };
      const items = Array.isArray(resp?.data?.items) ? resp.data.items : [];
      items.forEach(item => {
        const mapped = mapReporteItem(item);
        grouped[mapped.tab].push(mapped);
      });
      setReportesPorTab(grouped);
    } catch (e) {
      console.error('Error cargando reportes', e);
      showToast('No se pudieron cargar reportes', { type: 'error' })
    } finally {
      setLoadingReportes(false)
    }
  }, [showToast]);

  useEffect(() => {
    loadReportes();
  }, [loadReportes]);

  const handleReviewReporte = (tab, index, reporte) =>
    setModalReporte({ tab, index, reporte: { ...reporte } })

  const moveSolicitud = (from, to, index, extra = {}) => {
    setSolicitudesPorTab(prev => {
      const data = { ...prev }
      const item = { ...data[from][index], ...extra, tab: to }
      data[from] = data[from].filter((_, i) => i !== index)
      data[to]   = [...data[to], item]
      return data
    })
  }

  const moveReporte = (from, to, index, extra = {}) => {
    setReportesPorTab(prev => {
      const data = { ...prev }
      const item = { ...data[from][index], ...extra, tab: to }
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
      await loadReportes()
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
      await loadReportes()
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
      await loadReportes()
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario de forma permanente?')) return
    setDeletingUserId(userId)
    try {
      const resp = await apiFetch(`/api/usuarios/${userId}/permanent`, { method: 'DELETE' })
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo eliminar el usuario')
      }
      showToast('Usuario eliminado definitivamente', { type: 'success' })
      await loadUsuarios()
    } catch (e) {
      console.error('Error eliminando usuario', e)
      showToast(e?.message || 'No se pudo eliminar el usuario', { type: 'error' })
    } finally {
      setDeletingUserId(null)
    }
  }

  const closeAddDocente = () => {
    if (addingDocente) return
    setShowAddDocente(false)
  }

  const handleSearchChange = useCallback((value) => {
    if (activeSection === "Comisiones") {
      setSolicitudSearch(value);
    } else if (activeSection === "Reportes") {
      setReporteSearch(value);
    }
  }, [activeSection]);

  const clearSolicitudFilters = useCallback(() => {
    setSolicitudFilters({ desde: "", hasta: "" });
  }, []);

  const clearReporteFilters = useCallback(() => {
    setReporteFilters({ desde: "", hasta: "" });
  }, []);
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
  const solicitudesActivasRaw = solicitudesPorTab[activeTabComisiones] || []
  const reportesActivosRaw    = reportesPorTab[activeTabReportes]     || []
  const solicitudSearchTerm = solicitudSearch.trim().toLowerCase()
  const reporteSearchTerm = reporteSearch.trim().toLowerCase()
  const solicitudesActivas = solicitudesActivasRaw.filter((solicitud) => {
    const titulo = (solicitud.titulo || "").toLowerCase()
    const fecha = solicitud.fechaSalida || ""
    const matchesSearch = !solicitudSearchTerm || titulo.includes(solicitudSearchTerm)
    const matchesDate = isDateInRange(fecha, solicitudFilters)
    return matchesSearch && matchesDate
  })
  const reportesActivos = reportesActivosRaw.filter((reporte) => {
    const titulo = (reporte.titulo || "").toLowerCase()
    const fecha = reporte.fechaEntrega || ""
    const matchesSearch = !reporteSearchTerm || titulo.includes(reporteSearchTerm)
    const matchesDate = isDateInRange(fecha, reporteFilters)
    return matchesSearch && matchesDate
  })
  const solicitudFiltersApplied = Boolean(solicitudSearchTerm || solicitudFilters.desde || solicitudFilters.hasta)
  const reporteFiltersApplied = Boolean(reporteSearchTerm || reporteFilters.desde || reporteFilters.hasta)
  const solicitudDateActive = Boolean(solicitudFilters.desde || solicitudFilters.hasta)
  const reporteDateActive = Boolean(reporteFilters.desde || reporteFilters.hasta)
  const currentSearchValue = activeSection === "Comisiones"
    ? solicitudSearch
    : activeSection === "Reportes"
    ? reporteSearch
    : ""
  const currentSearchPlaceholder = activeSection === "Comisiones"
    ? "Buscar solicitud..."
    : activeSection === "Reportes"
    ? "Buscar reporte..."
    : ""

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
  onRefreshComisiones={loadSolicitudes}
  onRefreshReportes={loadReportes}
        disableAddDocenteButton={addingDocente}
        solicitudesActivas={solicitudesActivas}
        reportesActivos={reportesActivos}
        loadingSolicitudes={loadingSolicitudes}
        loadingReportes={loadingReportes}
        loadingUsuarios={loadingUsuarios}
        usuarios={usuarios}
        searchValue={currentSearchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={currentSearchPlaceholder}
        showSearch={activeSection !== "Usuarios"}
        solicitudFilters={solicitudFilters}
        setSolicitudFilters={setSolicitudFilters}
        reporteFilters={reporteFilters}
        setReporteFilters={setReporteFilters}
        clearSolicitudFilters={clearSolicitudFilters}
        clearReporteFilters={clearReporteFilters}
        solicitudFiltersApplied={solicitudFiltersApplied}
        reporteFiltersApplied={reporteFiltersApplied}
        solicitudDateActive={solicitudDateActive}
        reporteDateActive={reporteDateActive}
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
        handleDeleteUser={handleDeleteUser}
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
