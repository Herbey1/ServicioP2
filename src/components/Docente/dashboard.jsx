"use client"

import { useState, useEffect, useCallback } from "react"
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

const ESTADO_MAP = {
  EN_REVISION: { tab: "Pendientes", status: "En revisión" },
  APROBADA: { tab: "Aprobadas", status: "Aprobada" },
  RECHAZADA: { tab: "Rechazadas", status: "Rechazada" },
  DEVUELTA: { tab: "Devueltas", status: "Devuelta" }
};

const formatDateOnly = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return value.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const formatTimeOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  if (typeof value === "string" && value.length >= 16) {
    return value.slice(11, 16);
  }
  return "";
};

const mapSolicitudFromApi = (item, fallbackSolicitante = "") => {
  if (!item) return null;
  const estadoInfo = ESTADO_MAP[item.estado] || ESTADO_MAP.EN_REVISION;
  const tipoId = item.tipo_participacion_id;
  const tipoOtro = item.tipo_participacion_otro ?? "";
  const resolvedTipoId = tipoId ? String(tipoId) : (tipoOtro ? "OTHER" : "");
  return {
    id: item.id,
    titulo: item.asunto ?? "",
    solicitante: item.usuarios?.nombre ?? fallbackSolicitante,
    tipoParticipacionId: resolvedTipoId,
    tipoParticipacionOtro: tipoOtro,
    ciudad: item.ciudad ?? "",
    pais: item.pais ?? "",
    lugar: item.lugar ?? "",
    fechaSalida: formatDateOnly(item.fecha_salida),
    fechaRegreso: formatDateOnly(item.fecha_regreso),
    horaSalida: formatTimeOnly(item.hora_salida),
    horaRegreso: formatTimeOnly(item.hora_regreso),
    numeroPersonas: Number(item.num_personas ?? 1),
    necesitaTransporte: !!item.usa_unidad_transporte,
    cantidadCombustible: item.cantidad_combustible ?? "",
    programaEducativoId: item.programa_educativo_id ?? null,
    alumnosBeneficiados: item.alumnos_beneficiados ?? 0,
    proyectoInvestigacion: typeof item.proyecto_investigacion === "boolean"
      ? item.proyecto_investigacion
      : item.proyecto_investigacion === "SI",
    obtendraConstancia: !!item.obtendra_constancia,
    comentarios: item.comentarios ?? "",
    comentariosAdmin: item.motivo_estado || undefined,
    status: estadoInfo.status,
    estado: item.estado ?? "EN_REVISION",
    tab: estadoInfo.tab,
    archivos: Array.isArray(item.solicitud_archivos) ? item.solicitud_archivos : []
  };
};

const isDateInRange = (value, { desde, hasta }) => {
  if (!desde && !hasta) return true;
  if (!value) return false;
  if (desde && value < desde) return false;
  if (hasta && value > hasta) return false;
  return true;
};

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
    tipoParticipacionId: "",
    tipoParticipacionOtro: "",
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
    status: "En revisión",
    archivos: [],
    alumnosBeneficiados: 0
  }

  const [tiposParticipacion, setTiposParticipacion] = useState([])
  const [programasEducativos, setProgramasEducativos] = useState([])

  const [showCreateModal,   setShowCreateModal]   = useState(false)
  const [modalEditData,     setModalEditData]     = useState(null)   // { solicitud, index, tab }
  const [uploadingArchivos, setUploadingArchivos] = useState(false);
  const [removingArchivoIds, setRemovingArchivoIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSolicitud,      setNewSolicitud]      = useState(emptySolicitud)
  const [solicitudesPorTab, setSolicitudesPorTab] = useState({
    Pendientes : [],
    Aprobadas  : [],
    Rechazadas : [],
    Devueltas  : []
  })
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState([])
  const [solicitudSearch, setSolicitudSearch] = useState("")
  const [reporteSearch, setReporteSearch] = useState("")
  const [solicitudFilters, setSolicitudFilters] = useState({ desde: "", hasta: "" })
  const [reporteFilters, setReporteFilters] = useState({ desde: "", hasta: "" })

  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  useEffect(() => {
    if (!modalEditData) {
      setUploadingArchivos(false);
      setRemovingArchivoIds([]);
    }
  }, [modalEditData]);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoadingSolicitudes(true);
      const [solicitudesRes, tiposRes, programasRes] = await Promise.all([
        apiFetch('/api/solicitudes'),
        apiFetch('/api/catalogos/tipos-participacion'),
        apiFetch('/api/catalogos/programas')
      ]);

      const solicitudData = solicitudesRes?.data ?? {};
      const tiposList = Array.isArray(tiposRes?.data) ? tiposRes.data : [];
      const programasList = Array.isArray(programasRes?.data) ? programasRes.data : [];

      const grouped = { Pendientes: [], Aprobadas: [], Rechazadas: [], Devueltas: [] };
      const userName = typeof window !== "undefined" ? (localStorage.getItem('userName') || '') : '';
      const items = Array.isArray(solicitudData.items) ? solicitudData.items : [];
      const mappedSolicitudes = items
        .map(item => mapSolicitudFromApi(item, userName))
        .filter(Boolean);

      mappedSolicitudes.forEach((solicitud) => {
        const tabKey = grouped[solicitud.tab] ? solicitud.tab : 'Pendientes';
        grouped[tabKey].push(solicitud);
      });

      setSolicitudesPorTab(grouped);
      setSolicitudesAprobadas(mappedSolicitudes.filter(sol => sol.tab === 'Aprobadas'));
      setTiposParticipacion(tiposList);
      setProgramasEducativos(programasList);
      setNewSolicitud(prev => ({
        ...prev,
        tipoParticipacionId: prev.tipoParticipacionId || (tiposList[0]?.id ? String(tiposList[0].id) : ""),
        tipoParticipacionOtro: "",
        programaEducativoId: prev.programaEducativoId ?? programasList[0]?.id ?? null,
        archivos: Array.isArray(prev.archivos) ? prev.archivos : []
      }));
    } catch (e) {
      console.error('Error cargando datos iniciales', e);
      showToast('No se pudieron cargar las solicitudes', { type: 'error' });
    } finally {
      setLoadingSolicitudes(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSolicitudes();
  }, [loadSolicitudes]);

  // Escuchar cambios en localStorage para sincronizar entre pestañas (ej. admin aprueba)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'sgca_solicitudes_update') {
        loadSolicitudes();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadSolicitudes]);

  const fetchSolicitudDetalle = useCallback(async (solicitudId) => {
    const resp = await apiFetch(`/api/solicitudes/${solicitudId}`);
    if (!resp.ok) {
      throw new Error(resp.data?.msg || 'No se pudo obtener la solicitud');
    }
    const data = resp.data ?? {};
    const userName = typeof window !== "undefined" ? (localStorage.getItem('userName') || '') : '';
    return mapSolicitudFromApi(data, userName);
  }, []);

  const refreshModalSolicitud = useCallback(async (solicitudId) => {
    try {
      const detalle = await fetchSolicitudDetalle(solicitudId);
      setModalEditData(prev => {
        if (!prev || prev.id !== solicitudId) return prev;
        return { ...detalle, index: prev.index, tab: prev.tab };
      });
    } catch (e) {
      console.error('Error refrescando solicitud', e);
      showToast('No se pudo recargar la solicitud', { type: 'error' });
    }
  }, [fetchSolicitudDetalle, showToast]);

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

  /* CRUD Comisiones */
  const handleCreateSolicitud = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    // Validaciones mínimas en cliente (los inputs "required" no se validan al no usar <form onSubmit>)
    const firstTipoId = tiposParticipacion[0]?.id ?? null;
    const tipoSelectionRaw = newSolicitud.tipoParticipacionId;
    const tipoSelection =
      typeof tipoSelectionRaw === "number"
        ? String(tipoSelectionRaw)
        : (tipoSelectionRaw || "");
    const usingOtherTipo = tipoSelection === "OTHER";
    const resolvedTipoId = usingOtherTipo
      ? null
      : (tipoSelection
          ? (Number.parseInt(tipoSelection, 10) || null)
          : firstTipoId);
    const tipoParticipacionOtro = usingOtherTipo ? (newSolicitud.tipoParticipacionOtro || "").trim() : "";
    const progId = newSolicitud.programaEducativoId ?? programasEducativos[0]?.id ?? null;
    const reqs = [
      ['Asunto', newSolicitud.titulo],
      ['Tipo de participación', usingOtherTipo ? tipoParticipacionOtro : resolvedTipoId],
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
      showToast(`Completa el campo: ${missing[0]}`, { type: 'warning' });
      return;
    }

    try {
      const body = {
        asunto: newSolicitud.titulo,
        tipo_participacion_id: resolvedTipoId,
        tipo_participacion_otro: usingOtherTipo ? tipoParticipacionOtro : null,
        ciudad: newSolicitud.ciudad,
        pais: newSolicitud.pais,
        lugar: newSolicitud.lugar,
        fecha_salida: newSolicitud.fechaSalida,
        hora_salida: newSolicitud.horaSalida,
        fecha_regreso: newSolicitud.fechaRegreso,
        hora_regreso: newSolicitud.horaRegreso,
        num_personas: Number(newSolicitud.numeroPersonas) || 1,
        usa_unidad_transporte: !!newSolicitud.necesitaTransporte,
        cantidad_combustible: newSolicitud.necesitaTransporte
          ? Number(newSolicitud.cantidadCombustible ?? 0)
          : null,
        programa_educativo_id: progId,
        alumnos_beneficiados: newSolicitud.alumnosBeneficiados ?? 0,
        proyecto_investigacion: !!newSolicitud.proyectoInvestigacion,
        obtendra_constancia: !!newSolicitud.obtendraConstancia,
        comentarios: newSolicitud.comentarios
      }
      const resp = await apiFetch('/api/solicitudes', { method: 'POST', body });
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo crear la solicitud');
      }
      const nuevaId = resp.data?.id ?? resp.id;
      if (!nuevaId) {
        throw new Error('No se obtuvo el identificador de la solicitud');
      }

      const archivosSeleccionados = Array.isArray(newSolicitud.archivos) ? newSolicitud.archivos : [];
      if (archivosSeleccionados.length > 0) {
        const errores = [];
        for (const file of archivosSeleccionados) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            const uploadResp = await apiFetch(`/api/solicitudes/${nuevaId}/archivos`, {
              method: 'POST',
              body: formData
            });
            if (!uploadResp.ok) {
              throw new Error(uploadResp.data?.msg || 'Error al subir archivo');
            }
          } catch (uploadErr) {
            errores.push(`${file.name}: ${uploadErr?.message || 'Error inesperado'}`);
          }
        }
        if (errores.length) {
          showToast(`Algunos archivos no se subieron:\n${errores.join('\n')}`, { type: 'error' });
        }
      }

      setShowCreateModal(false);
      await loadSolicitudes();
      setNewSolicitud({
        ...emptySolicitud,
        solicitante: typeof window !== 'undefined' ? (localStorage.getItem('userName') || "") : "",
        tipoParticipacionId: firstTipoId ? String(firstTipoId) : "",
        tipoParticipacionOtro: "",
        programaEducativoId: programasEducativos[0]?.id ?? null,
        archivos: []
      });
      setActiveTabComisiones("Pendientes");
      showToast('Solicitud creada', { type: 'success' });
    } catch (e) {
      console.error('Error creando solicitud', e)
      showToast(e?.message || 'Error creando solicitud', { type: 'error' });
    }
  }

  const openEditSolicitud = useCallback(async (solicitud, index, tab) => {
    if (!solicitud?.id) return;
    setModalEditData({
      ...solicitud,
      index,
      tab,
      archivos: Array.isArray(solicitud.archivos) ? solicitud.archivos : [],
      loading: true
    });
    try {
      const detalle = await fetchSolicitudDetalle(solicitud.id);
      setModalEditData(prev => {
        if (!prev || prev.id !== solicitud.id) return prev;
        return { ...detalle, index, tab };
      });
    } catch (e) {
      console.error('Error cargando detalle de la solicitud', e);
      showToast('No se pudo cargar la solicitud seleccionada', { type: 'error' });
      setModalEditData(null);
    }
  }, [fetchSolicitudDetalle, showToast]);

  const handleUploadArchivos = useCallback(async (files) => {
    if (!modalEditData?.id || !Array.isArray(files) || files.length === 0) return;
    setUploadingArchivos(true);
    const solicitudId = modalEditData.id;
    const errores = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const resp = await apiFetch(`/api/solicitudes/${solicitudId}/archivos`, {
          method: 'POST',
          body: formData
        });
        if (!resp.ok) {
          throw new Error(resp.data?.msg || 'Error al subir archivo');
        }
      } catch (err) {
        errores.push(`${file.name}: ${err?.message || 'Error inesperado'}`);
      }
    }
    await refreshModalSolicitud(solicitudId);
    setUploadingArchivos(false);
    if (errores.length) {
      showToast(`Algunos archivos no se subieron:\n${errores.join('\n')}`, { type: 'error' });
    } else {
      showToast('Archivos adjuntados', { type: 'success' });
    }
  }, [modalEditData, refreshModalSolicitud, showToast]);

  const handleRemoveArchivo = useCallback(async (archivo) => {
    if (!modalEditData?.id || !archivo?.id) return;
    setRemovingArchivoIds(prev => prev.includes(archivo.id) ? prev : [...prev, archivo.id]);
    try {
      const resp = await apiFetch(`/api/solicitudes/${modalEditData.id}/archivos/${archivo.id}`, { method: 'DELETE' });
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo eliminar el archivo');
      }
      showToast('Archivo eliminado', { type: 'success' });
      await refreshModalSolicitud(modalEditData.id);
    } catch (e) {
      console.error('Error eliminando archivo', e);
      showToast(e?.message || 'Error eliminando archivo', { type: 'error' });
    } finally {
      setRemovingArchivoIds(prev => prev.filter(id => id !== archivo.id));
    }
  }, [modalEditData, refreshModalSolicitud, showToast]);

  const handleSaveEditSolicitud = async () => {
    if (!modalEditData) return;
    const current = modalEditData;
    const firstTipoId = tiposParticipacion[0]?.id ?? null;
    const tipoSelectionRaw = current.tipoParticipacionId;
    const tipoSelection =
      typeof tipoSelectionRaw === "number"
        ? String(tipoSelectionRaw)
        : (tipoSelectionRaw || "");
    const usingOtherTipo = tipoSelection === "OTHER";
    const resolvedTipoId = usingOtherTipo
      ? null
      : (tipoSelection
          ? (Number.parseInt(tipoSelection, 10) || null)
          : firstTipoId);
    const tipoParticipacionOtro = usingOtherTipo ? (current.tipoParticipacionOtro || "").trim() : "";
    const progId = current.programaEducativoId ?? programasEducativos[0]?.id ?? null;

    const reqs = [
      ['Asunto', current.titulo],
      ['Tipo de participación', usingOtherTipo ? tipoParticipacionOtro : resolvedTipoId],
      ['Ciudad', current.ciudad],
      ['País', current.pais],
      ['Lugar', current.lugar],
      ['Fecha de salida', current.fechaSalida],
      ['Hora de salida', current.horaSalida],
      ['Fecha de regreso', current.fechaRegreso],
      ['Hora de regreso', current.horaRegreso],
      ['Número de personas', current.numeroPersonas],
      ['Programa educativo', progId]
    ];
    const missing = reqs.find(([_, v]) => v === undefined || v === null || v === '');
    if (missing) {
      showToast(`Completa el campo: ${missing[0]}`, { type: 'warning' });
      return;
    }

    const body = {
      asunto: current.titulo,
      tipo_participacion_id: resolvedTipoId,
      tipo_participacion_otro: usingOtherTipo ? tipoParticipacionOtro : null,
      ciudad: current.ciudad,
      pais: current.pais,
      lugar: current.lugar,
      fecha_salida: current.fechaSalida,
      fecha_regreso: current.fechaRegreso,
      hora_salida: current.horaSalida,
      hora_regreso: current.horaRegreso,
      num_personas: Number(current.numeroPersonas) || 1,
      usa_unidad_transporte: current.necesitaTransporte,
      cantidad_combustible: current.necesitaTransporte
        ? (current.cantidadCombustible === "" ? null : Number(current.cantidadCombustible))
        : null,
      programa_educativo_id: progId,
      alumnos_beneficiados: current.alumnosBeneficiados ?? 0,
      proyecto_investigacion: current.proyectoInvestigacion,
      obtendra_constancia: current.obtendraConstancia,
      comentarios: current.comentarios ?? ""
    };

    setModalEditData(prev => (prev ? { ...prev, loading: true } : prev));
    try {
      const resp = await apiFetch(`/api/solicitudes/${current.id}`, {
        method: 'PATCH',
        body
      });
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo actualizar la solicitud');
      }
      showToast('Solicitud actualizada', { type: 'success' });
      setModalEditData(null);
      await loadSolicitudes();
      if (current.tab === 'Devueltas') {
        setActiveTabComisiones('Pendientes');
      }
    } catch (e) {
      console.error('Error actualizando solicitud', e);
      showToast(e?.message || 'Error actualizando solicitud', { type: 'error' });
      setModalEditData(prev => (prev ? { ...prev, loading: false } : prev));
    }
  }

  const confirmDeleteSolicitud = async () => {
    if (!modalEditData) {
      setShowDeleteConfirm(false);
      return;
    }
    const { id, tab } = modalEditData;
    try {
      const resp = await apiFetch(`/api/solicitudes/${id}/cancelar`, { method: 'POST' });
      if (!resp.ok) {
        throw new Error(resp.data?.msg || 'No se pudo cancelar la solicitud');
      }
      showToast('Solicitud eliminada', { type: 'success' });
      setModalEditData(null);
      await loadSolicitudes();
      if (tab && tab !== 'Pendientes') {
        setActiveTabComisiones('Pendientes');
      }
    } catch (e) {
      console.error('Error cancelando solicitud', e);
      showToast(e?.message || 'Error cancelando solicitud', { type: 'error' });
    } finally {
      setShowDeleteConfirm(false);
    }
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
  const currentSearchValue = activeSection === "Comisiones"
    ? solicitudSearch
    : activeSection === "Reportes"
    ? reporteSearch
    : "";
  const currentSearchPlaceholder = activeSection === "Comisiones"
    ? "Buscar solicitud..."
    : activeSection === "Reportes"
    ? "Buscar reporte..."
    : "";

  /* ──────────────── Listas visibles ──────────────── */
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
  const filterLabelClass = `text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`
  const filterInputClass = `mt-1 w-full rounded-md border px-3 py-2 text-sm ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-700 placeholder-gray-500'}`
  const clearButtonClass = `px-3 py-2 rounded-full border text-sm font-medium transition-colors ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`

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
            searchValue={currentSearchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder={currentSearchPlaceholder}
          />
        )}

        {/* ----- SECCIÓN COMISIONES ----- */}
        {activeSection === "Comisiones" && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3 w-full">
              <h2 className="text-2xl font-bold">
                Mis solicitudes
              </h2>
              <div className="flex items-end gap-4">
                <div className="flex flex-col">
                  <label className={filterLabelClass}>Fecha desde</label>
                  <input
                    type="date"
                    value={solicitudFilters.desde}
                    onChange={(e) => setSolicitudFilters(prev => ({ ...prev, desde: e.target.value }))}
                    className={filterInputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={filterLabelClass}>Fecha hasta</label>
                  <input
                    type="date"
                    value={solicitudFilters.hasta}
                    onChange={(e) => setSolicitudFilters(prev => ({ ...prev, hasta: e.target.value }))}
                    className={filterInputClass}
                    min={solicitudFilters.desde || undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSolicitudFilters}
                  className={`${clearButtonClass} ${!solicitudDateActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={!solicitudDateActive}
                >
                  Limpiar fechas
                </button>
              </div>
            </div>

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
                    handleEditClick={(selectedSolicitud, selectedIndex) =>
                      openEditSolicitud(selectedSolicitud, selectedIndex, activeTabComisiones)
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 opacity-80">
                  <p>
                    {solicitudFiltersApplied
                      ? `No hay solicitudes ${activeTabComisiones.toLowerCase()} que coincidan con la búsqueda o el rango de fechas.`
                      : `No hay solicitudes ${activeTabComisiones.toLowerCase()}.`}
                  </p>
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
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3 w-full">
              <h2 className="text-2xl font-bold">
                Mis reportes
              </h2>
              <div className="flex items-end gap-4">
                <div className="flex flex-col">
                  <label className={filterLabelClass}>Fecha desde</label>
                  <input
                    type="date"
                    value={reporteFilters.desde}
                    onChange={(e) => setReporteFilters(prev => ({ ...prev, desde: e.target.value }))}
                    className={filterInputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={filterLabelClass}>Fecha hasta</label>
                  <input
                    type="date"
                    value={reporteFilters.hasta}
                    onChange={(e) => setReporteFilters(prev => ({ ...prev, hasta: e.target.value }))}
                    className={filterInputClass}
                    min={reporteFilters.desde || undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearReporteFilters}
                  className={`${clearButtonClass} ${!reporteDateActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={!reporteDateActive}
                >
                  Limpiar fechas
                </button>
              </div>
            </div>

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
                  <p>
                    {reporteFiltersApplied
                      ? `No hay reportes ${activeTabReportes.toLowerCase()} que coincidan con la búsqueda o el rango de fechas.`
                      : `No hay reportes ${activeTabReportes.toLowerCase()}.`}
                  </p>
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
          onUploadArchivos={handleUploadArchivos}
          onRemoveArchivo={handleRemoveArchivo}
          uploadingArchivos={uploadingArchivos}
          removingArchivoIds={removingArchivoIds}
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
