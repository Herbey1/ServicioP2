"use client"

import TabSelector from "../../Docente/components/TabSelector"
import ReportCard  from "./ReportCard"
import SkeletonList from "../../common/SkeletonList"
import { useTheme } from "../../../context/ThemeContext"

export default function ReportesSection({
  activeTab,
  setActiveTab,
  tabs,
  reportesActivos,
  loading = false,
  counts = {},
  handleReviewClick
}) {
  const { darkMode } = useTheme();

  return (
    <>
      {/* Tabs */}
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
      />

      {/* Lista de reportes */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonList rows={4} />
        ) : reportesActivos.length > 0 ? (
          reportesActivos.map((reporte, index) => (
            <ReportCard
              key={index}
              reporte={reporte}
              onReviewClick={() => handleReviewClick(activeTab, index, reporte)}
            />
          ))
        ) : (
          <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay reportes {activeTab.toLowerCase()}
          </div>
        )}

        {/* Placeholders si está vacío */}
        {reportesActivos.length === 0 &&
          [...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-6 h-[60px]`}
            />
          ))}
      </div>
    </>
  )
}
