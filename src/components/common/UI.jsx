// Componentes UI reutilizables con accesibilidad mejorada
import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from './Icons';

// Botones consistentes
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'left',
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-green-500 disabled:bg-gray-300",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500 disabled:bg-gray-50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 disabled:bg-gray-300",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 disabled:bg-gray-300",
    outline: "border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500 disabled:border-gray-300 disabled:text-gray-300"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`${children ? 'mr-2' : ''} h-4 w-4`} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${children ? 'ml-2' : ''} h-4 w-4`} />
      )}
    </button>
  );
};

// Input con iconos y estados
export const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  helpText, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm 
            focus:border-green-500 focus:ring-green-500 
            disabled:bg-gray-50 disabled:text-gray-500
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            dark:focus:border-green-400 dark:focus:ring-green-400
            ${Icon ? 'pl-10' : 'px-3'} py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id={`${props.id}-help`}>
          {helpText}
        </p>
      )}
    </div>
  );
};

// Badge/Status indicators
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon: Icon,
  className = '',
  ...props 
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  };
  
  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </span>
  );
};

// Card component consistente
export const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '',
  padding = 'md',
  ...props 
}) => {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className={`${paddings[padding]} border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={paddings[padding]}>
        {children}
      </div>
    </div>
  );
};

// Status indicator para solicitudes/reportes
export const StatusIndicator = ({ status, showIcon = true, showText = true }) => {
  const statusConfig = {
    'En revisión': { 
      variant: 'pending', 
      icon: ClockIcon,
      text: 'En Revisión'
    },
    'Pendiente': { 
      variant: 'pending', 
      icon: ClockIcon,
      text: 'Pendiente'
    },
    'Aprobada': { 
      variant: 'success', 
      icon: CheckCircleIcon,
      text: 'Aprobada'
    },
    'Aprobado': { 
      variant: 'success', 
      icon: CheckCircleIcon,
      text: 'Aprobado'
    },
    'Rechazada': { 
      variant: 'error', 
      icon: XCircleIcon,
      text: 'Rechazada'
    },
    'Rechazado': { 
      variant: 'error', 
      icon: XCircleIcon,
      text: 'Rechazado'
    },
    'Devuelta': { 
      variant: 'warning', 
      icon: ExclamationTriangleIcon,
      text: 'Devuelta'
    },
    'Devuelto': { 
      variant: 'warning', 
      icon: ExclamationTriangleIcon,
      text: 'Devuelto'
    }
  };
  
  const config = statusConfig[status] || { 
    variant: 'default', 
    icon: ClockIcon,
    text: status 
  };
  
  return (
    <Badge 
      variant={config.variant}
      icon={showIcon ? config.icon : null}
    >
      {showText ? config.text : null}
    </Badge>
  );
};

// Alert/Notification component
export const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '',
  ...props 
}) => {
  const types = {
    success: {
      classes: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200",
      icon: CheckCircleIcon,
      iconClasses: "text-green-400"
    },
    error: {
      classes: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200",
      icon: XCircleIcon,
      iconClasses: "text-red-400"
    },
    warning: {
      classes: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200",
      icon: ExclamationTriangleIcon,
      iconClasses: "text-yellow-400"
    },
    info: {
      classes: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200",
      icon: ExclamationTriangleIcon,
      iconClasses: "text-blue-400"
    }
  };
  
  const config = types[type];
  const Icon = config.icon;
  
  return (
    <div 
      className={`border rounded-lg p-4 ${config.classes} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClasses}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          <div className={title ? "mt-2 text-sm" : "text-sm"}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.iconClasses}`}
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading component
export const Loading = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <svg 
        className={`animate-spin text-green-600 ${sizes[size]}`} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
};

export { XMarkIcon } from './Icons';