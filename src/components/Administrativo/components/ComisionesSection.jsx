import React from "react";
import SkeletonList from "../../common/SkeletonList";
import TabSelector from "../../Docente/components/TabSelector";
import SolicitudCard from "./SolicitudCard";
import { useTheme } from "../../../context/ThemeContext";

export default function ComisionesSection({ 
  activeTab, 
  setActiveTab, 
  tabs, 
  solicitudesActivas, 
  loading = false,
  counts = {},
  handleReviewClick 
}) {
  const { darkMode } = useTheme();

  return (
    <>
      {/* TabSelector Component */}
      <TabSelector 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        counts={counts}
      />

      {/* Lista de Solicitudes */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonList rows={4} />
        ) : solicitudesActivas.length > 0 ? (
          solicitudesActivas.map((solicitud, index) => (
            <SolicitudCard 
              key={index}
              solicitud={solicitud}
              onReviewClick={() => handleReviewClick(activeTab, index, solicitud)}
              isAdmin={true}
            />
          ))
        ) : (
          <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay solicitudes {activeTab.toLowerCase()}
          </div>
        )}

        {/* Espacios vacíos solo si no hay suficientes solicitudes reales */}
        {solicitudesActivas.length === 0 && (
          [...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-6 h-[60px]`}
            />
          ))
        )}
      </div>
    </>
  );
}
