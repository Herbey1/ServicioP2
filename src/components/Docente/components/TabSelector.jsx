"use client"

import { useTheme } from "../../../context/ThemeContext";

export default function TabSelector({ tabs, activeTab, setActiveTab }) {
  const { darkMode } = useTheme();  return (
    <div className={`flex w-full mb-6 rounded-full overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 text-center py-2 font-medium text-sm transition-all ${
            activeTab === tab
              ? "bg-green-700 text-white"
              : darkMode 
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
