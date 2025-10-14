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
  searchValue = "",
  onSearchChange = () => {},
  searchPlaceholder = "",
  showSearch = false,
  solicitudFilters = { desde: "", hasta: "" },
  setSolicitudFilters = () => {},
  reporteFilters = { desde: "", hasta: "" },
  setReporteFilters = () => {},
  clearSolicitudFilters = () => {},
  clearReporteFilters = () => {},
  solicitudFiltersApplied = false,
  reporteFiltersApplied = false,
  solicitudDateActive = false,
  reporteDateActive = false,
  /* Callbacks de revisión */
  handleReviewSolicitud,
  handleReviewReporte,
  handleChangeUserRole,
  handleToggleUserActive,
  handleDeleteUser,
  userActionId,
  deletingUserId
}) {
  const { darkMode } = useTheme();
  const filterLabelClass = `text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`;
  const filterInputClass = `mt-1 w-full rounded-md border px-3 py-2 text-sm ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-700 placeholder-gray-500'}`;
  const clearButtonClass = `px-3 py-2 rounded-full border text-sm font-medium transition-colors ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`;

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
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
      />

      {activeSection === "Comisiones" && (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3 w-full">
          <h2 className="text-2xl font-bold">
            Solicitudes de comisiones
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
      )}

      {activeSection === "Reportes" && (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3 w-full">
          <h2 className="text-2xl font-bold">
            Reportes académicos
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
      )}

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
          filtersApplied={solicitudFiltersApplied}
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
          filtersApplied={reporteFiltersApplied}
        />
      ) : (
        <UsuariosSection
          usuarios={usuarios}
          loading={loadingUsuarios}
          onChangeRole={handleChangeUserRole}
          onToggleActive={handleToggleUserActive}
          onDeleteUser={handleDeleteUser}
          busyUserId={userActionId}
          deletingUserId={deletingUserId}
          onAddUser={onAddDocenteClick}
          addingUser={disableAddDocenteButton}
        />
      )}
    </div>
  )
}
