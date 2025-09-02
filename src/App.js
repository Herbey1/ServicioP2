"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import LoginPage from './components/Login/LoginPage';
import SolicitudesInterface from './components/Docente/dashboard';
import AdminDashboard from './components/Administrativo/dashboard';
import { ThemeProvider } from './context/ThemeContext';

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
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={userRole === 'docente' ? "/dashboard" : "/admin"} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          } />
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
    </ThemeProvider>
  )
}

export default App
