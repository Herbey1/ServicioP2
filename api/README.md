# API REST para el Sistema de Gestión de Comisiones Académicas

Este directorio contiene la estructura propuesta para la API REST que comunicará el frontend con la base de datos.

## Estructura de la API

La API sigue una arquitectura RESTful con los siguientes endpoints principales:

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/register` - Registrar nuevo usuario (requiere aprobación admin)
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña con token

### Usuarios

- `GET /api/users/profile` - Obtener perfil del usuario actual
- `PUT /api/users/profile` - Actualizar perfil del usuario actual
- `GET /api/users` - Listar usuarios (solo admin)
- `GET /api/users/:id` - Obtener usuario por ID (solo admin)
- `PUT /api/users/:id` - Actualizar usuario (solo admin)
- `DELETE /api/users/:id` - Desactivar usuario (solo admin)

### Solicitudes de Comisión

- `GET /api/solicitudes` - Listar solicitudes (filtradas por usuario o todas para admin)
- `POST /api/solicitudes` - Crear nueva solicitud
- `GET /api/solicitudes/:id` - Obtener solicitud por ID
- `PUT /api/solicitudes/:id` - Actualizar solicitud (si está en estado que lo permite)
- `DELETE /api/solicitudes/:id` - Eliminar solicitud (solo si está en borrador o requiere correcciones)
- `POST /api/solicitudes/:id/archivos` - Subir archivos para una solicitud
- `GET /api/solicitudes/:id/archivos` - Listar archivos de una solicitud
- `GET /api/solicitudes/:id/archivos/:fileId` - Descargar archivo específico
- `DELETE /api/solicitudes/:id/archivos/:fileId` - Eliminar archivo

### Revisión de Solicitudes (Admin)

- `PUT /api/solicitudes/:id/aprobar` - Aprobar solicitud
- `PUT /api/solicitudes/:id/rechazar` - Rechazar solicitud
- `PUT /api/solicitudes/:id/devolver` - Devolver solicitud para correcciones

### Reportes Académicos

- `GET /api/reportes` - Listar reportes (filtrados por usuario o todos para admin)
- `POST /api/reportes` - Crear nuevo reporte
- `GET /api/reportes/:id` - Obtener reporte por ID
- `PUT /api/reportes/:id` - Actualizar reporte (si está en estado que lo permite)
- `DELETE /api/reportes/:id` - Eliminar reporte (solo si está en borrador o requiere correcciones)
- `POST /api/reportes/:id/evidencias` - Subir archivos de evidencia
- `GET /api/reportes/:id/evidencias` - Listar archivos de evidencia
- `GET /api/reportes/:id/evidencias/:fileId` - Descargar evidencia específica
- `DELETE /api/reportes/:id/evidencias/:fileId` - Eliminar evidencia

### Revisión de Reportes (Admin)

- `PUT /api/reportes/:id/aprobar` - Aprobar reporte
- `PUT /api/reportes/:id/rechazar` - Rechazar reporte
- `PUT /api/reportes/:id/devolver` - Devolver reporte para correcciones

### Datos Maestros

- `GET /api/departamentos` - Listar departamentos
- `GET /api/programas` - Listar programas educativos
- `GET /api/tipos-participacion` - Listar tipos de participación
- `GET /api/tipos-reporte` - Listar tipos de reporte

### Notificaciones

- `GET /api/notificaciones` - Listar notificaciones del usuario actual
- `PUT /api/notificaciones/:id/leer` - Marcar notificación como leída
- `PUT /api/notificaciones/leer-todas` - Marcar todas las notificaciones como leídas

## Implementación Propuesta

Para implementar esta API, se recomienda utilizar:

- Node.js con Express como framework
- MySQL para la base de datos
- JWT (JSON Web Tokens) para autenticación
- Multer para manejo de archivos
- Bcrypt para encriptación de contraseñas
- Cors para manejo de solicitudes cross-origin
- Dotenv para manejo de variables de entorno

## Estructura de Proyecto Recomendada

```
api/
├── config/               # Configuración de la aplicación
│   ├── database.js       # Configuración de conexión a base de datos
│   ├── auth.js           # Configuración de autenticación
│   └── upload.js         # Configuración de carga de archivos
├── controllers/          # Controladores de la API
│   ├── authController.js
│   ├── userController.js
│   ├── solicitudController.js
│   ├── reporteController.js
│   └── ...
├── middleware/           # Middleware personalizado
│   ├── auth.js           # Verificación de autenticación
│   ├── roles.js          # Verificación de roles
│   └── upload.js         # Manejo de archivos
├── models/               # Modelos de datos
│   ├── userModel.js
│   ├── solicitudModel.js
│   ├── reporteModel.js
│   └── ...
├── routes/               # Definición de rutas
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── solicitudRoutes.js
│   ├── reporteRoutes.js
│   └── ...
├── utils/                # Utilidades
│   ├── logger.js
│   ├── mailer.js         # Envío de correos
│   └── validators.js     # Validación de datos
├── server.js             # Punto de entrada
└── package.json
```
