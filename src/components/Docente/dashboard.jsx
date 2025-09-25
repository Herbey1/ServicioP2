"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { apiFetch } from "../../api/client"

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
import SkeletonList from "../common/SkeletonList";
import ErrorBoundary from "../common/ErrorBoundary";
import { useToast } from "../../context/ToastContext";

export default function DashboardDocente({ setIsAuthenticated }) {
  /* ──────────────── Navegación y UI global ──────────────── */
  const navigate = useNavigate()
  const { darkMode } = useTheme();
  const { showToast } = useToast();
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
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
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
    solicitante: typeof window !== 'undefined' ? (localStorage.getItem('userName') || "") : "",
    tipoParticipacionId: null,
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
    programaEducativoId: null,
    proyectoInvestigacion: false,
    obtendraConstancia: true,
    comentarios: "",
    status: "En revisión"
  }

  const [tiposParticipacion, setTiposParticipacion] = useState([])
  const [programasEducativos, setProgramasEducativos] = useState([])

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
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState([])

  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  useEffect(() => {
    async function load() {
      try {
        setLoadingSolicitudes(true);
        const [resp, tipos, programas] = await Promise.all([
          apiFetch('/api/solicitudes'),
          apiFetch('/api/catalogos/tipos-participacion'),
          apiFetch('/api/catalogos/programas')
        ]);

        const grouped = { Pendientes: [], Aprobadas: [], Rechazadas: [], Devueltas: [] };
        const userName = localStorage.getItem('userName') || '';
        const estadoMap = {
          EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
          APROBADA: { tab: 'Aprobadas', status: 'Aprobada' },
          RECHAZADA: { tab: 'Rechazadas', status: 'Rechazada' },
          DEVUELTA: { tab: 'Devueltas', status: 'Devuelta' }
        };
        const aprobadas = [];
        (resp.items || []).forEach(item => {
          const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
          const sItem = {
            id: item.id,
            titulo: item.asunto,
            solicitante: item.usuarios?.nombre || userName,
            fechaSalida: item.fecha_salida?.slice(0,10),
            status: map.status,
            comentariosAdmin: item.motivo_estado || undefined
          };
          grouped[map.tab].push(sItem);
          if (item.estado === 'APROBADA') aprobadas.push(sItem);
        });
        setSolicitudesPorTab(grouped);
        setSolicitudesAprobadas(aprobadas);
        setTiposParticipacion(tipos);
        setProgramasEducativos(programas);
        setNewSolicitud(prev => ({
          ...prev,
          tipoParticipacionId: tipos[0]?.id || null,
          programaEducativoId: programas[0]?.id || null,
        }));
      } catch (e) {
        console.error('Error cargando datos iniciales', e);
        showToast('No se pudieron cargar las solicitudes', { type: 'error' });
      } finally {
        setLoadingSolicitudes(false);
      }
    }
    load();
  }, []);

  /* CRUD Comisiones */
  const handleCreateSolicitud = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    // Validaciones mínimas en cliente (los inputs "required" no se validan al no usar <form onSubmit>)
    const tipoId = newSolicitud.tipoParticipacionId ?? tiposParticipacion[0]?.id ?? null;
    const progId = newSolicitud.programaEducativoId ?? programasEducativos[0]?.id ?? null;
    const reqs = [
      ['Asunto', newSolicitud.titulo],
      ['Tipo de participación', tipoId],
      ['Ciudad', newSolicitud.ciudad],
      ['País', newSolicitud.pais],
      ['Lugar', newSolicitud.lugar],
      ['Fecha de salida', newSolicitud.fechaSalida],
      ['Hora de salida', newSolicitud.horaSalida],
      ['Fecha de regreso', newSolicitud.fechaRegreso],
      ['Hora de regreso', newSolicitud.horaRegreso],
      ['Número de personas', newSolicitud.numeroPersonas],
      ['Programa educativo', progId]
    ];
    const missing = reqs.find(([_, v]) => v === undefined || v === null || v === '');
    if (missing) {
      alert(`Completa el campo: ${missing[0]}`);
      return;
    }

    try {
      const body = {
        asunto: newSolicitud.titulo,
        tipo_participacion_id: tipoId,
        ciudad: newSolicitud.ciudad,
        pais: newSolicitud.pais,
        lugar: newSolicitud.lugar,
        fecha_salida: newSolicitud.fechaSalida,
        hora_salida: newSolicitud.horaSalida,
        fecha_regreso: newSolicitud.fechaRegreso,
        hora_regreso: newSolicitud.horaRegreso,
        num_personas: Number(newSolicitud.numeroPersonas) || 1,
        usa_unidad_transporte: !!newSolicitud.necesitaTransporte,
        cantidad_combustible: newSolicitud.cantidadCombustible ?? null,
        programa_educativo_id: progId,
        alumnos_beneficiados: 0,
        proyecto_investigacion: !!newSolicitud.proyectoInvestigacion,
        obtendra_constancia: !!newSolicitud.obtendraConstancia,
        comentarios: newSolicitud.comentarios
      }
      const resp = await apiFetch('/api/solicitudes', { method: 'POST', body })
      const id = resp.id || resp?.solicitud?.id

      setSolicitudesPorTab(prev => ({
        ...prev,
        Pendientes: [...prev.Pendientes, { ...newSolicitud, id }]
      }))
      setNewSolicitud({
        ...emptySolicitud,
        tipoParticipacionId: tiposParticipacion[0]?.id || null,
        programaEducativoId: programasEducativos[0]?.id || null,
      })
      setShowCreateModal(false)
      setActiveTabComisiones("Pendientes")
      showToast('Solicitud creada', { type: 'success' });
    } catch (e) {
      console.error('Error creando solicitud', e)
      showToast(e?.message || 'Error creando solicitud', { type: 'error' });
    }
  }

  const handleSaveEditSolicitud = async () => {
    const { tab, index, id, ...s } = modalEditData
    try {
      await apiFetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        body: {
          asunto: s.titulo,
          tipo_participacion_id: s.tipoParticipacionId,
          ciudad: s.ciudad,
          pais: s.pais,
          lugar: s.lugar,
          fecha_salida: s.fechaSalida,
          fecha_regreso: s.fechaRegreso,
          hora_salida: s.horaSalida,
          hora_regreso: s.horaRegreso,
          num_personas: s.numeroPersonas,
          usa_unidad_transporte: s.necesitaTransporte,
          cantidad_combustible: s.cantidadCombustible,
          programa_educativo_id: s.programaEducativoId,
          proyecto_investigacion: s.proyectoInvestigacion,
          obtendra_constancia: s.obtendraConstancia,
          comentarios: s.comentarios,
        }
      })
      const lista = [...solicitudesPorTab[tab]]
      lista[index] = { ...s, id }
      setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
      setModalEditData(null)
    } catch (e) {
      console.error('Error actualizando solicitud', e)
      showToast(e?.message || 'Error actualizando solicitud', { type: 'error' });
    }
  }

  const confirmDeleteSolicitud = async () => {
    const { tab, index, id } = modalEditData
    try {
      await apiFetch(`/api/solicitudes/${id}/cancelar`, { method: 'POST' })
      const lista = [...solicitudesPorTab[tab]]
      lista.splice(index, 1)
      setSolicitudesPorTab(prev => ({ ...prev, [tab]: lista }))
    } catch (e) {
      console.error('Error cancelando solicitud', e)
      showToast('Error cancelando solicitud', { type: 'error' });
    }
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

  // Cargar reportes del docente
  useEffect(() => {
    async function loadMyReportes() {
      try {
        const resp = await apiFetch('/api/reportes');
        const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] };
        const estadoMap = {
          EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
          APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
          RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
          DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
        };
        (resp.items || []).forEach(item => {
          const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
          grouped[map.tab].push({
            id: item.id,
            titulo: item.asunto || 'Reporte de Comisión',
            solicitante: item.usuarios?.nombre || '',
            fechaEntrega: item.fecha_entrega?.slice(0,10) || '',
            status: map.status,
            descripcion: item.descripcion || '',
            comentariosAdmin: item.motivo_estado || undefined
          });
        });
        setReportesPorTab(grouped);
      } catch (e) {
        console.error('Error cargando mis reportes', e);
      }
    }
    loadMyReportes();
  }, []);

  /* CRUD Reportes (docente) */
  const handleCreateReporte = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!nuevoReporte.solicitudId) {
      alert('Selecciona la solicitud');
      return;
    }
    if (!nuevoReporte.descripcion || !nuevoReporte.fechaEntrega) {
      alert('Completa descripción y fecha de entrega');
      return;
    }
    try {
      await apiFetch('/api/reportes', {
        method: 'POST',
        body: {
          solicitud_id: nuevoReporte.solicitudId,
          descripcion: nuevoReporte.descripcion,
        }
      });
      // Recargar la lista desde API
      const resp = await apiFetch('/api/reportes');
      const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] };
      const estadoMap = {
        EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
        APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
        RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
        DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
      };
      (resp.items || []).forEach(item => {
        const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
        grouped[map.tab].push({
          id: item.id,
          titulo: item.asunto || 'Reporte de Comisión',
          solicitante: item.usuarios?.nombre || '',
          fechaEntrega: item.fecha_entrega?.slice(0,10) || '',
          status: map.status,
          descripcion: item.descripcion || '',
          comentariosAdmin: item.motivo_estado || undefined
        });
      });
      setReportesPorTab(grouped);
      setNuevoReporte(emptyReporte);
      setShowCreateReporteModal(false);
      setActiveTabReportes('Pendientes');
      showToast('Reporte creado', { type: 'success' });
    } catch (e) {
      console.error('Error creando reporte', e);
      showToast(e?.message || 'Error creando reporte', { type: 'error' });
    }
  }

  const handleSaveEditReporte = async (updated) => {
    const src = updated || modalEditReporte;
    const { tab, index, id, ...r } = src;
    try {
      // Solo mandamos descripcion al backend; título lo provee la solicitud vinculada
      await apiFetch(`/api/reportes/${id}`, { method: 'PATCH', body: { descripcion: r.descripcion } });
      // Tras editar, recarga la lista real desde API
      const resp = await apiFetch('/api/reportes');
      const grouped = { Pendientes: [], Aprobados: [], Rechazados: [], Devueltos: [] };
      const estadoMap = {
        EN_REVISION: { tab: 'Pendientes', status: 'En revisión' },
        APROBADO: { tab: 'Aprobados', status: 'Aprobado' },
        RECHAZADO: { tab: 'Rechazados', status: 'Rechazado' },
        DEVUELTO: { tab: 'Devueltos', status: 'Devuelto' }
      };
      (resp.items || []).forEach(item => {
        const map = estadoMap[item.estado] || estadoMap.EN_REVISION;
        grouped[map.tab].push({
          id: item.id,
          titulo: item.asunto || 'Reporte de Comisión',
          solicitante: item.usuarios?.nombre || '',
          fechaEntrega: item.fecha_entrega?.slice(0,10) || '',
          status: map.status,
          descripcion: item.descripcion || '',
          comentariosAdmin: item.motivo_estado || undefined
        });
      });
      setReportesPorTab(grouped);
      setModalEditReporte(null);
      setActiveTabReportes('Pendientes');
    } catch (e) {
      console.error('Error actualizando reporte', e);
      showToast(e?.message || 'Error actualizando reporte', { type: 'error' });
    }
  }

  const handleDeleteReporte = () => {
    // Aún sin endpoint: solo afecta a locales temporales
    const { tab, index } = modalEditReporte;
    const lista = [...reportesPorTab[tab]];
    lista.splice(index, 1);
    setReportesPorTab(prev => ({ ...prev, [tab]: lista }));
    setModalEditReporte(null);
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
      <ErrorBoundary>
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
              counts={{
                Pendientes: solicitudesPorTab.Pendientes.length,
                Aprobadas: solicitudesPorTab.Aprobadas.length,
                Rechazadas: solicitudesPorTab.Rechazadas.length,
                Devueltas: solicitudesPorTab.Devueltas.length,
              }}
            />

            <div className="space-y-4 flex-1 overflow-y-auto">
              {loadingSolicitudes ? (
                <SkeletonList rows={4} />
              ) : solicitudesActivas.length > 0 ? (
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
                <div className="text-center py-10 opacity-80">
                  <p>No hay solicitudes {activeTabComisiones.toLowerCase()}.</p>
                  {activeTabComisiones === 'Pendientes' && (
                    <button onClick={() => setShowCreateModal(true)} className="mt-3 px-4 py-2 bg-green-700 text-white rounded-full">
                      Crear solicitud
                    </button>
                  )}
                </div>
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
              counts={{
                Pendientes: reportesPorTab.Pendientes.length,
                Aprobados: reportesPorTab.Aprobados.length,
                Rechazados: reportesPorTab.Rechazados.length,
                Devueltos: reportesPorTab.Devueltos.length,
              }}
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
                <div className="text-center py-10 opacity-80">
                  <p>No hay reportes {activeTabReportes.toLowerCase()}.</p>
                  {activeTabReportes === 'Pendientes' && (
                    <button onClick={() => setShowCreateReporteModal(true)} className="mt-3 px-4 py-2 bg-green-700 text-white rounded-full">
                      Crear reporte
                    </button>
                  )}
                </div>
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
        solicitudesDisponibles={solicitudesAprobadas}
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
      </ErrorBoundary>
    </div>
  )
}
