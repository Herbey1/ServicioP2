"use client"

import ComisionesSection from "./ComisionesSection"
import ReportesSection   from "./ReportesSection"
import UsuariosSection   from "./UsuariosSection"
import Header            from "./Header"
import { useTheme } from "../../../context/ThemeContext"
import { Bars3Icon } from "../../common/Icons"

export default function MainContent({
  /* Layout */
  sidebarOpen,
  toggleSidebar,
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
}) {  
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex-1 p-4 sm:p-6 lg:p-8 flex flex-col transition-all duration-300 safe-positioning
                  ${sidebarOpen ? "ml-72" : "ml-0"} 
                  ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
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

      {/* Header con botón hamburguesa y título */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Botón hamburguesa - solo visible cuando sidebar cerrado */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="bg-green-700 hover:bg-green-800 text-white 
                     p-3 rounded-xl cursor-pointer shadow-lg transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Abrir menú de navegación"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        <h2 className="text-2xl font-bold">
          {activeSection === "Comisiones"
            ? "Solicitudes de comisiones"
            : activeSection === "Reportes"
            ? "Reportes académicos"
            : "Gestión de usuarios"}
        </h2>
      </div>

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
