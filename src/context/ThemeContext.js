import { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto para el tema
const ThemeContext = createContext();

// Proveedor del contexto que contiene el estado y la lógica del tema
export function ThemeProvider({ children }) {
  // Verificar si hay un tema guardado en localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode === 'true';
  });  // Guardar el tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    
    // Aplicar la clase 'dark' al elemento root (html) para usar con Tailwind
    // Verificar si estamos en la página de login para no aplicar el tema oscuro
    const isLoginPage = window.location.pathname.includes('/login');
    
    if (darkMode && !isLoginPage) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Efecto adicional para detectar cambios de ruta y garantizar que el login siempre esté en modo claro
  useEffect(() => {
    const handleRouteChange = () => {
      const isLoginPage = window.location.pathname.includes('/login');
      if (isLoginPage) {
        document.documentElement.classList.remove('dark');
      } else if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    };
    
    // Escuchar los cambios en la URL
    window.addEventListener('popstate', handleRouteChange);
    
    // Verificar la ruta actual al montar el componente
    handleRouteChange();
    
    // Limpiar el listener al desmontar
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [darkMode]);

  // Toggle para cambiar entre modo claro y oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Proporcionar el estado y funciones a los componentes hijos
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el contexto del tema
export function useTheme() {
  return useContext(ThemeContext);
}
