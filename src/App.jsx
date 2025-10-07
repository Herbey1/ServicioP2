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

function App() {  // Inicializar el estado de autenticación y el rol desde localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'docente';
  });
  
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

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
