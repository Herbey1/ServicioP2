"use client"

export default function TabSelector({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex w-full mb-6 rounded-full overflow-hidden border border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 text-center py-2 font-medium text-sm transition-all ${
            activeTab === tab
              ? "bg-green-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
