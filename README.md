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

# Sistema de Gestión de Comisiones Académicas (SGCA)

En la Facultad de Ciencias Químicas e Ingeniería, perteneciente a la Universidad Autónoma de Baja California, se busca mejorar constantemente la calidad de educación que se le proporciona a los estudiantes, por lo mismo, los docentes llegan a participar en actividades extracurriculares que puedan causar un impacto positivo en los programas educativos de la facultad o directamente a los mismos estudiantes, como lo son los congresos, viajes de prácticas, entre otros. Dichas actividades pueden llegar a presentarse dentro del horario laboral del docente, pero al reconocerse la importancia del conocimiento y las habilidades que se obtienen al asistir a estos eventos, se les otorga una comisión académica a los docentes para justificar su ausencia en las correspondientes clases que toman lugar dentro del periodo de duración del evento.

El proceso actual para solicitar una comisión académica consiste en llenar manualmente un formato impreso para después conseguir que este sea firmado y autorizado por la subdirectora de la facultad. Esta dinámica es poco conveniente en cuestiones de tiempo y esfuerzo; teniendo en cuenta que además de llevar un registro de las comisiones, también es necesario que la subdirectora entregue un reporte con estadísticas y resultados de las mismas, lo cual es complicado de realizar manualmente. Debido a esto, se decidió automatizar este proceso, además de que con la implementación del sistema se busca también reducir la probabilidad de generar errores manuales y ocasionar discrepancia entre la información ingresada. 

## Objetivo principal 

El objetivo principal del sistema es automatizar y optimizar el proceso de solicitud y reporte de comisiones académicas, las cuales justifican la ausencia de un docente en sus horas de trabajo dentro de la institución, debido a actividades extracurriculares que aporten un impacto positivo en la universidad, así como en sus estudiantes y docentes.

## Descripción General

El sistema de gestión de comisiones académicas tiene como propósito facilitar y automatizar los procesos involucrados en la solicitud, aprobación y seguimiento de comisiones académicas dentro de la FCQI de la UABC. Este sistema permitirá a los usuarios interactuar eficientemente con las distintas funcionalidades que abarca, desde la creación de solicitudes hasta la entrega de reportes y evidencias finales.
Entre las características principales del sistema, encontramos las siguientes:
###Gestión de usuarios:
Permitir a los usuarios autenticarse mediante sus credenciales institucionales y asignar roles específicos como solicitantes (personal académico) o administradores (personal administrativo).
###Creación y envío de solicitudes:
Los usuarios van a tener la función para generar nuevas solicitudes de comisiones académicas, y subir la documentación requerida para justificar su solicitud.
###Revisión y retroalimentación:
Los administradores podrán revisar las solicitudes enviadas por los usuarios, proporcionar retroalimentación en caso de errores o información faltante, y aprobar o rechazar las solicitudes.
###Seguimiento de comisiones:
Los usuarios van a poder ver el estado de sus solicitudes en tiempo real y recibir notificaciones sobre cambios en el estado de la solicitud.
###Entrega de reportes y evidencias:
Cuando finalice la comisión, el sistema permitirá que los solicitantes suban un reporte con los resultados obtenidos y adjunten cualquier evidencia requerida.
###Análisis y estadísticas:
Los administradores tendrán acceso a herramientas de análisis que permitirán visualizar estadísticas relacionadas con el número de comisiones aprobadas, rechazadas, motivos de solicitud, y tendencias generales en la actividad académica.
###Historial de solicitudes:
El sistema almacenará un historial de todas las solicitudes y reportes de comisiones, que podrán ser consultados por los usuarios para fines de referencia o auditoría

Estas funcionalidades estarán diseñadas para mejorar la eficiencia operativa, reducir tiempo y errores en el proceso manual, y facilitar la toma de decisiones mediante la recolección de información importante y análisis de datos.

...