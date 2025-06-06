# Sistema de Gestión de Comisiones Académicas

Sistema para la gestión y seguimiento de solicitudes de comisiones académicas de la Facultad de Ciencias Químicas e Ingeniería (FCQI) de la UABC.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
src/
├── assets/
│   └── images/
│       ├── Logo brochazos.png
│       └── logo uabc.jpg
├── components/
│   ├── login.jsx         # Componente de inicio de sesión
│   ├── TailwindLoader.js
│   ├── Administrativo/   # Componentes para el usuario administrativo
│   │   ├── dashboard.jsx
│   │   └── components/
│   │       ├── ReviewSolicitudModal.jsx
│   │       └── SolicitudCard.jsx
│   └── Docente/         # Componentes para el usuario docente
│       ├── dashboard.jsx
│       └── components/
│           ├── CreateSolicitudModal.jsx
│           ├── DeleteConfirmModal.jsx
│           ├── EditSolicitudModal.jsx
│           ├── Header.jsx
│           ├── LogoutConfirmModal.jsx
│           ├── Sidebar.jsx
│           ├── SolicitudCard.jsx
│           └── TabSelector.jsx
├── App.js               # Componente principal con enrutamiento
└── index.js             # Punto de entrada de la aplicación
```

## Flujo de Autenticación

El sistema cuenta con dos tipos de usuario:

1. **Docente**: Puede crear, editar y eliminar solicitudes de comisiones académicas.
2. **Administrativo**: Puede revisar, aprobar, rechazar o devolver solicitudes.

Al iniciar sesión, dependiendo del tipo de usuario seleccionado, el sistema redirige a:

- `/dashboard` para usuarios docentes.
- `/admin` para usuarios administrativos.

## Componentes Principales

### Login

- Permite autenticación para diferentes tipos de usuarios.
- Maneja la redirección según el rol del usuario.

### Dashboard Docente

- Visualización de solicitudes en diferentes estados (Pendientes, Aprobadas, Rechazadas, Devueltas).
- Creación, edición y eliminación de solicitudes.

### Dashboard Administrativo

- Visualización de solicitudes enviadas por los docentes.
- Funcionalidad para aprobar, rechazar o devolver solicitudes para corrección.
- Capacidad para añadir comentarios en las solicitudes.

## Implementación

El proyecto está desarrollado con React, utilizando:

- **React Router** para la navegación.
- **TailwindCSS** para el diseño de la interfaz.
- **LocalStorage** para la persistencia básica de datos de sesión.

## Desarrollo Futuro

- Integración con backend para persistencia de datos.
- Implementación de sistema de notificaciones.
- Generación de reportes y estadísticas.

## Roadmap
 CRUD Solicitudes (Docente)
 Flujo de Revisión Solicitudes (Admin)
 CRUD Reportes (Docente)
 Flujo de Revisión Reportes (Admin)
 Sección Perfil
 Dashboard estadístico con gráficas
 Subida real de archivos a S3/Cloudinary
 Single Sign-On (UABC)
 Notificaciones por correo
 Modo oscuro completo

## Créditos
### Gámez Gastelum Alberto
### García Mónica
### Gamez Gaxiola Carlos Herbey
