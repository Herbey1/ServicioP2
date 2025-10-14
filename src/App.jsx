"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import LoginPage from './components/Login/LoginPage';
import SolicitudesInterface from './components/Docente/dashboard';
import AdminDashboard from './components/Administrativo/dashboard';
import ContactPage from './pages/ContactPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import { apiFetch } from './api/client';

function App() {
  // Inicializar estados como false hasta validar el token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('docente');
  const [isLoading, setIsLoading] = useState(true);

  // Validar token al cargar la app
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Intentar hacer una llamada autenticada para validar el token
        const response = await apiFetch('/api/perfil');
        
        if (response.ok) {
          // Token válido
          setIsAuthenticated(true);
          setUserRole(storedRole || 'docente');
        } else {
          // Token inválido, limpiar localStorage
          console.log('Token inválido, limpiando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Error de conexión o token inválido
        console.log('Error validando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('userRole', userRole);
    }
  }, [userRole, isAuthenticated]);

  // Mostrar loading mientras validamos el token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Validando sesión...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={userRole === 'docente' ? "/dashboard" : "/admin"} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          } />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated && userRole === 'docente'
                ? <SolicitudesInterface setIsAuthenticated={setIsAuthenticated} />
                : isAuthenticated && userRole === 'admin'
                  ? <Navigate to="/admin" />
                  : <Navigate to="/login" />
            }
          />
          <Route
            path="/admin"
            element={
              isAuthenticated && userRole === 'admin'
                ? <AdminDashboard setIsAuthenticated={setIsAuthenticated} />
                : isAuthenticated && userRole === 'docente'
                  ? <Navigate to="/dashboard" />
                  : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === 'docente' ? "/dashboard" : "/admin") : "/login"} />} />
        </Routes>
      </Router>
      <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
