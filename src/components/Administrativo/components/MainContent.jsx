"use client"

import ComisionesSection from "./ComisionesSection"
import ReportesSection   from "./ReportesSection"
import Header            from "./Header"
import { useTheme } from "../../../context/ThemeContext"

export default function MainContent({
  /* Layout */
  sidebarOpen,
  /* Sección / pestañas */
  activeSection, setActiveSection,
  activeTab,     setActiveTab,
  tabs,
  /* Datos */
  solicitudesActivas,
  reportesActivos,
  loadingSolicitudes = false,
  loadingReportes = false,
  counts,
  /* Callbacks de revisión */
  handleReviewSolicitud,
  handleReviewReporte
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
      />

      {/* Título dinámico */}
      <h2 className="text-2xl font-bold mb-6">
        {activeSection === "Comisiones"
          ? "Solicitudes de comisiones"
          : "Reportes académicos"}
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
      ) : (
        <ReportesSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          reportesActivos={reportesActivos}
          loading={loadingReportes}
          counts={counts}
          handleReviewClick={handleReviewReporte}
        />
      )}
    </div>
  )
}
