"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import LoginPage from './components/Login/LoginPage';
import SolicitudesInterface from './components/Docente/dashboard';
import AdminDashboard from './components/Administrativo/dashboard';

function App() {  // Inicializar el estado de autenticación y el rol desde localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'docente'
  });

  // Guardar el estado de autenticación y rol en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated)
  }, [isAuthenticated]);
  
  useEffect(() => {
    localStorage.setItem('userRole', userRole)
  }, [userRole]);

  return (
    <Router>      <Routes>        <Route path="/login" element={
          isAuthenticated ? <Navigate to={userRole === 'docente' ? "/dashboard" : "/admin"} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
        } />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <SolicitudesInterface setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={isAuthenticated ? <AdminDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === 'docente' ? "/dashboard" : "/admin") : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App