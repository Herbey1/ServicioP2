import React from "react";
import ComisionesSection from "./ComisionesSection";
import ReportesSection from "./ReportesSection";
import Header from "./Header";

export default function MainContent({ 
  sidebarOpen, 
  activeSection, 
  setActiveSection,
  activeTab, 
  setActiveTab, 
  tabs, 
  solicitudesActivas, 
  handleReviewClick 
}) {
  return (
    <div className={`flex-1 bg-white p-8 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
      {/* Header Component */}
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isAdmin={true}
        title="Panel de Administración"
      />

      {/* Título dinámico según la sección activa */}
      <h2 className="text-2xl font-bold mb-6">
        {activeSection === "Comisiones" ? "Solicitudes de comisiones" : "Reportes administrativos"}
      </h2>

      {/* Contenido condicional según la sección */}
      {activeSection === "Comisiones" ? (
        <ComisionesSection 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          solicitudesActivas={solicitudesActivas}
          handleReviewClick={handleReviewClick}
        />
      ) : (
        <ReportesSection />
      )}
    </div>
  );
}
