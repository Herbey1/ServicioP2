"use client"

import ComisionesSection from "./ComisionesSection"
import ReportesSection   from "./ReportesSection"
import UsuariosSection   from "./UsuariosSection"
import Header            from "./Header"
import { useTheme } from "../../../context/ThemeContext"

export default function MainContent({
  /* Layout */
  sidebarOpen,
  /* Sección / pestañas */
  activeSection, setActiveSection,
  activeTab,     setActiveTab,
  tabs,
  onAddDocenteClick,
  disableAddDocenteButton = false,
  /* Datos */
  solicitudesActivas,
  reportesActivos,
  usuarios = [],
  loadingSolicitudes = false,
  loadingReportes = false,
  loadingUsuarios = false,
  counts,
  /* Callbacks de revisión */
  handleReviewSolicitud,
  handleReviewReporte,
  handleChangeUserRole,
  handleToggleUserActive,
  handleDeleteUser,
  handleViewUserProfile,
  userActionId,
  deletingUserId
}) {  const { darkMode } = useTheme();

  return (
    <div
      className={`flex-1 p-8 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-0"
      } ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
    >
      {/* Header */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin
        title="Panel de Administración"
        onAddDocenteClick={activeSection === "Usuarios" ? null : onAddDocenteClick}
        disableAddDocente={disableAddDocenteButton}
      />

      {/* Título dinámico */}
      <h2 className="text-2xl font-bold mb-6">
        {activeSection === "Comisiones"
          ? "Solicitudes de comisiones"
          : activeSection === "Reportes"
          ? "Reportes académicos"
          : "Gestión de usuarios"}
      </h2>

      {/* Contenido según sección */}
      {activeSection === "Comisiones" ? (
        <ComisionesSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          solicitudesActivas={solicitudesActivas}
          loading={loadingSolicitudes}
          counts={counts}
          handleReviewClick={handleReviewSolicitud}
        />
      ) : activeSection === "Reportes" ? (
        <ReportesSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          reportesActivos={reportesActivos}
          loading={loadingReportes}
          counts={counts}
          handleReviewClick={handleReviewReporte}
        />
      ) : (
        <UsuariosSection
          usuarios={usuarios}
          loading={loadingUsuarios}
          onChangeRole={handleChangeUserRole}
          onToggleActive={handleToggleUserActive}
          onDeleteUser={handleDeleteUser}
          onViewProfile={handleViewUserProfile}
          busyUserId={userActionId}
          deletingUserId={deletingUserId}
          onAddUser={onAddDocenteClick}
          addingUser={disableAddDocenteButton}
        />
      )}
    </div>
  )
}
