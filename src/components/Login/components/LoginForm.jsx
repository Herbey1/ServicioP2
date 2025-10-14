import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EmailIcon, LockIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "../../common/Icons";
import { Button, Input } from "../../common/UI";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Email Input */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Correo Institucional
        </label>
        <div className="flex rounded-lg shadow-sm">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <EmailIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-l-lg 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500 
                       dark:bg-gray-800 dark:border-gray-600 dark:text-white
                       transition-all duration-200"
              placeholder="tu.nombre"
              autoComplete="email"
              required
            />
          </div>
          <span className="inline-flex items-center px-2 py-2 rounded-r-lg border border-l-0 border-gray-300 
                         bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-xs">
            @uabc.edu.mx
          </span>
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label 
          htmlFor="password" 
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <LockIcon className="h-4 w-4 text-gray-400" />
          </div>
          <style jsx>{`
            input::-webkit-reveal {
              display: none;
            }
            input::-ms-reveal {
              display: none;
            }
          `}</style>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-green-500 focus:border-green-500 
                     dark:bg-gray-800 dark:border-gray-600 dark:text-white
                     transition-all duration-200"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            data-lpignore="true"
            data-1p-ignore
            style={{WebkitTextSecurity: showPassword ? 'none' : 'disc'}}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-2 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? 
              <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" /> :
              <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            }
          </button>
        </div>
        
        {/* Forgot password link */}
        <div className="text-right mt-1">
          <Link 
            to="/recuperar" 
            className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 
                     dark:hover:text-green-300 transition-colors duration-200"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        loading={isLoading}
        variant="primary"
        size="md"
        icon={ArrowRightIcon}
        iconPosition="right"
        className="w-full mt-3"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      {/* Help text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
        Usa tu correo institucional UABC y contraseña
      </p>
    </form>
  );
}
