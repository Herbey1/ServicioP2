"use client"

import { useEffect, useMemo, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { useTheme } from "../../../context/ThemeContext";
import DarkModeToggle from "../../common/DarkModeToggle";
import { apiFetch } from "../../../api/client";
import { useToast } from "../../../context/ToastContext";

const PROFILE_FIELDS = [
  { key: "nombre", label: "Nombre completo", editable: true },
  { key: "correo", label: "Correo institucional", editable: false },
  {
    key: "rol",
    label: "Rol",
    editable: false,
    transform: (value) => (value === "ADMIN" ? "Administrativo" : "Docente"),
  },
  { key: "telefono", label: "Teléfono", editable: true },
  { key: "departamento", label: "Departamento / Programa", editable: true },
  { key: "categoria", label: "Categoría", editable: true },
];

const FALLBACK_PROFILE = {
  nombre: "—",
  correo: "—",
  rol: "DOCENTE",
  telefono: "",
  departamento: "",
  categoria: "",
};

export default function ProfileSection() {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log("[DEBUG] Cargando perfil...");
      
      // Verificar token antes de hacer la petición
      const token = localStorage.getItem('token');
      console.log("[DEBUG] Token presente:", !!token);
      
      const resp = await apiFetch("/api/perfil");
      console.log("[DEBUG] Respuesta completa del perfil:", JSON.stringify(resp, null, 2));
      
      // Verificar si hay error del servidor (status HTTP o respuesta ok: false)
      if (resp.status >= 400 || (resp.ok === false)) {
        const errorMsg = resp.data?.msg || resp.msg || `Error del servidor (${resp.status})`;
        console.error("[Perfil] Error del servidor:", errorMsg, resp);
        
        // Si es error de autenticación, mostrar mensaje específico
        if (resp.status === 401) {
          showToast("Sesión expirada, por favor inicia sesión nuevamente", { type: "error" });
          return;
        }
        
        // Para otros errores del servidor, usar datos del localStorage como fallback
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
        
        if (userName || userRole) {
          console.log("[DEBUG] Usando datos del localStorage como fallback");
          setProfile({
            ...FALLBACK_PROFILE,
            nombre: userName || FALLBACK_PROFILE.nombre,
            rol: userRole || FALLBACK_PROFILE.rol,
          });
          showToast("Usando datos guardados localmente (problema temporal del servidor)", { type: "warning" });
          return;
        }
        
        showToast(errorMsg, { type: "error" });
        return;
      }
      
      // Si todo está bien, obtener los datos del perfil
      const next = resp.profile || resp.data?.profile;
      console.log("[DEBUG] Datos del perfil extraídos:", next);
      
      if (next) {
        setProfile({
          ...FALLBACK_PROFILE,
          ...next,
        });
        console.log("[DEBUG] Perfil cargado exitosamente");
      } else {
        // Fallback con datos del localStorage
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
        
        setProfile({
          ...FALLBACK_PROFILE,
          nombre: userName || FALLBACK_PROFILE.nombre,
          rol: userRole || FALLBACK_PROFILE.rol,
        });
        
        showToast("Perfil cargado con datos básicos", { type: "info" });
      }
      
    } catch (error) {
      console.error("[Perfil] Error cargando perfil", error);
      
      // Fallback final con localStorage
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      
      if (userName || userRole) {
        setProfile({
          ...FALLBACK_PROFILE,
          nombre: userName || FALLBACK_PROFILE.nombre,
          rol: userRole || FALLBACK_PROFILE.rol,
        });
        showToast("Error de conexión, usando datos guardados", { type: "warning" });
      } else {
        showToast("Error de conexión al cargar el perfil", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayFields = useMemo(() => PROFILE_FIELDS, []);

  const handleSaveProfile = async (draft) => {
    try {
      const payload = {
        nombre: draft.nombre ?? "",
        telefono: draft.telefono ?? "",
        departamento: draft.departamento ?? "",
        categoria: draft.categoria ?? "",
      };
      const resp = await apiFetch("/api/perfil", { method: "PUT", body: payload });
      if (!resp.ok) {
        showToast(resp.data?.msg || "No se pudo actualizar el perfil", { type: "error" });
        return false;
      }
      const next = resp.profile ?? resp.data?.profile ?? payload;
      setProfile((prev) => ({ ...prev, ...next }));
      showToast("Perfil actualizado", { type: "success" });
      setShowEdit(false);
      return true;
    } catch (error) {
      console.error("[Perfil] Error guardando perfil", error);
      showToast("No se pudo actualizar el perfil", { type: "error" });
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`rounded-xl shadow p-8 w-full max-w-3xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Mi perfil
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Administra tus datos de contacto y la información que comparte el sistema.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button
              onClick={() => setShowEdit(true)}
              disabled={loading}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 text-white transition-colors"
              }`}
            >
              Editar perfil
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className={`h-6 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
            <div className={`h-6 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
            <div className={`h-6 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
            <div className={`h-6 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
          </div>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayFields.map(({ key, label, transform }) => {
              const rawValue = profile?.[key];
              const value =
                transform && rawValue !== undefined && rawValue !== null
                  ? transform(rawValue)
                  : rawValue;
              return (
                <div key={key}>
                  <dt
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </dt>
                  <dd
                    className={`text-lg font-semibold break-words ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {value ? value : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>

      <EditProfileModal
        open={showEdit}
        profile={profile}
        close={() => setShowEdit(false)}
        save={handleSaveProfile}
        fields={displayFields}
      />
    </div>
  );
}
