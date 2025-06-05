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

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
