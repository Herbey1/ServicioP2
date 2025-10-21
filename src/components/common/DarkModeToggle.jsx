import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

export default function DarkModeToggle({ 
  size = 'md', 
  showLabel = false, 
  variant = 'toggle', // 'toggle' | 'button'
  className = '' 
}) {
  const { darkMode, toggleDarkMode } = useTheme();
  
  if (variant === 'button') {
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };
    
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5', 
      lg: 'h-6 w-6'
    };

    return (
      <button
        onClick={toggleDarkMode}
        className={`
          inline-flex items-center justify-center rounded-lg
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${sizes[size]}
          ${darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 focus:ring-yellow-500' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500'
          }
          ${className}
        `}
        aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={darkMode ? "Modo claro" : "Modo oscuro"}
      >
        <div className="relative overflow-hidden">
          {/* Sun Icon */}
          <SunIcon 
            className={`
              ${iconSizes[size]} transition-all duration-300 transform
              ${darkMode 
                ? 'translate-y-6 opacity-0 rotate-180' 
                : 'translate-y-0 opacity-100 rotate-0'
              }
            `}
          />
          
          {/* Moon Icon */}
          <MoonIcon 
            className={`
              ${iconSizes[size]} absolute inset-0 transition-all duration-300 transform
              ${darkMode 
                ? 'translate-y-0 opacity-100 rotate-0' 
                : '-translate-y-6 opacity-0 -rotate-180'
              }
            `}
          />
        </div>
        
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {darkMode ? 'Claro' : 'Oscuro'}
          </span>
        )}
      </button>
    );
  }

  // Toggle variant (original style improved)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Sun icon */}
      <div className={`transition-all duration-200 ${darkMode ? 'text-gray-400' : 'text-yellow-500'}`}>
        <SunIcon className="h-5 w-5" />
      </div>
      
      {/* Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer group">
        <input 
          type="checkbox"
          className="sr-only"
          checked={darkMode}
          onChange={toggleDarkMode}
          aria-label={darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro"}
        />
        <div className={`
          relative w-11 h-6 rounded-full transition-all duration-200 ease-in-out
          focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500
          ${darkMode 
            ? 'bg-green-600 shadow-inner' 
            : 'bg-gray-300 shadow-inner'
          }
        `}>
          <div className={`
            absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-md
            transition-all duration-200 ease-in-out transform
            flex items-center justify-center
            ${darkMode ? 'translate-x-5' : 'translate-x-0'}
          `}>
            {/* Mini icons inside the toggle */}
            <div className="relative w-3 h-3 overflow-hidden">
              <SunIcon className={`
                absolute inset-0 w-3 h-3 text-yellow-500 transition-all duration-200 transform
                ${darkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}
              `} />
              <MoonIcon className={`
                absolute inset-0 w-3 h-3 text-gray-600 transition-all duration-200 transform
                ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}
              `} />
            </div>
          </div>
        </div>
      </label>
      
      {/* Moon icon */}
      <div className={`transition-all duration-200 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`}>
        <MoonIcon className="h-5 w-5" />
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {darkMode ? 'Modo oscuro' : 'Modo claro'}
        </span>
      )}
    </div>
  );
}
