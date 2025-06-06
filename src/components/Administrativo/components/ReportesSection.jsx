"use client"

import TabSelector from "../../Docente/components/TabSelector"
import ReportCard  from "./ReportCard"

export default function ReportesSection({
  activeTab,
  setActiveTab,
  tabs,
  reportesActivos,
  handleReviewClick
}) {
  return (
    <>
      {/* Tabs */}
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Lista de reportes */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {reportesActivos.length > 0 ? (
          reportesActivos.map((reporte, index) => (
            <ReportCard
              key={index}
              reporte={reporte}
              onReviewClick={() => handleReviewClick(activeTab, index, reporte)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No hay reportes {activeTab.toLowerCase()}
          </div>
        )}

        {/* Placeholders si está vacío */}
        {reportesActivos.length === 0 &&
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl px-4 py-6 h-[60px]" />
          ))}
      </div>
    </>
  )
}
