"use client"

import ComisionesSection from "./ComisionesSection"
import ReportesSection   from "./ReportesSection"
import Header            from "./Header"

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
  /* Callbacks de revisión */
  handleReviewSolicitud,
  handleReviewReporte
}) {
  return (
    <div
      className={`flex-1 bg-white p-8 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-0"
      }`}
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
          handleReviewClick={handleReviewSolicitud}
        />
      ) : (
        <ReportesSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          reportesActivos={reportesActivos}
          handleReviewClick={handleReviewReporte}
        />
      )}
    </div>
  )
}
