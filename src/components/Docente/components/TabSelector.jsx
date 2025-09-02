"use client"

import { useTheme } from "../../../context/ThemeContext";

export default function TabSelector({ tabs, activeTab, setActiveTab, counts = {} }) {
  const { darkMode } = useTheme();  return (
    <div className={`flex w-full mb-6 rounded-full overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 text-center py-2 font-medium text-sm transition-all relative ${
            activeTab === tab
              ? "bg-green-700 text-white"
              : darkMode 
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-current={activeTab === tab ? 'page' : undefined}
        >
          {tab}
          {Number.isFinite(counts[tab]) && (
            <span className={`ml-2 inline-block min-w-[1.5rem] px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-white text-green-700' : (darkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-800')
            }`} aria-label={`Total en ${tab}: ${counts[tab]}`}>
              {counts[tab]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
