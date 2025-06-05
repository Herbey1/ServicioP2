"use client"

import { useState } from "react"

export default function Sidebar({ activeSection, setActiveSection, sidebarOpen, toggleSidebar, confirmLogout }) {
  return (
    <>
      {/* Hamburger Menu Button */}
      <label 
        htmlFor="nav-toggle" 
        className="fixed top-4 left-4 z-50 cursor-pointer"
        onClick={toggleSidebar}
      >
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white' : 'bg-green-800'}`}></div>
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white w-0' : 'bg-green-800'}`}></div>
        <div className={`bar transition-all duration-300 ${sidebarOpen ? 'bg-white transform -translate-y-2 -rotate-45' : 'bg-green-800'}`}></div>
      </label>
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-green-800 transform transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full py-12 px-6">
          <div className="flex-1">
            <ul className="mt-12 space-y-6">
              <li>
                <a 
                  href="#" 
                  onClick={() => setActiveSection("Comisiones")} 
                  className="text-white text-xl hover:text-green-200 relative group flex items-center"
                >
                  <span>Comisiones</span>
                  <span className={`absolute h-0.5 bg-white bottom-0 left-0 transition-all duration-300 ${activeSection === "Comisiones" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={() => setActiveSection("Reportes")} 
                  className="text-white text-xl hover:text-green-200 relative group flex items-center"
                >
                  <span>Reportes</span>
                  <span className={`absolute h-0.5 bg-white bottom-0 left-0 transition-all duration-300 ${activeSection === "Reportes" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-xl hover:text-green-200 relative group flex items-center">
                  <span>Perfil</span>
                  <span className="absolute h-0.5 w-0 bg-white bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Logout Button Inside Sidebar */}
          <button 
            onClick={confirmLogout}
            className="text-white border-2 border-white py-2 px-8 rounded-full hover:bg-white hover:text-green-800 transition-colors duration-300"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      {/* Pestaña lateral para abrir el sidebar cuando está cerrado */}
      {!sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-green-800 text-white py-4 px-2 rounded-r-md cursor-pointer z-40 shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      {/* Overlay to close sidebar when clicking outside */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => toggleSidebar()}
        ></div>
      )}
    </>
  )
}
