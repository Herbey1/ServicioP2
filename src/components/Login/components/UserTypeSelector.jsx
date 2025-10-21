import React from "react";
import { AcademicCapIcon, CogIcon } from "../../common/Icons";

export default function UserTypeSelector({ userType, setUserType }) {
  const userTypes = [
    {
      id: "docente",
      label: "Docente",
      description: "Gestión de solicitudes y reportes",
      icon: AcademicCapIcon
    },
    {
      id: "administrador", 
      label: "Administrador",
      description: "Administración del sistema",
      icon: CogIcon
    }
  ];

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
        Selecciona tu tipo de usuario
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {userTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = userType === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setUserType(type.id)}
              className={`
                relative rounded-lg border-2 p-3 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                ${isSelected 
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                }
              `}
              aria-pressed={isSelected}
              aria-describedby={`${type.id}-description`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg mb-2
                  ${isSelected 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <h3 className={`
                  text-xs font-semibold mb-0.5
                  ${isSelected 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-gray-900 dark:text-gray-100'
                  }
                `}>
                  {type.label}
                </h3>
                
                <p 
                  id={`${type.id}-description`}
                  className={`
                    text-xs leading-tight
                    ${isSelected 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {type.description}
                </p>
              </div>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
