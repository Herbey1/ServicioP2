import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center">
      {/* Ícono de sol para modo claro */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-yellow-500'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
        />
      </svg>
      
      {/* Switch */}
      <label className="inline-flex relative items-center cursor-pointer">
        <input 
          type="checkbox"
          className="sr-only"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <div className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-4 peer-focus:ring-green-300 
        ${darkMode ? 'after:translate-x-full after:border-white bg-green-700' : 'bg-gray-200'} 
        after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer`}>
        </div>
      </label>
      
      {/* Ícono de luna para modo oscuro */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ml-2 ${darkMode ? 'text-blue-300' : 'text-gray-400'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
        />
      </svg>
    </div>
  );
}
