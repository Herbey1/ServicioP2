# Análisis de despliegue – SGCA

## Resumen ejecutivo

**¿Está listo para desplegar?**  
**Casi.** El proyecto está bien estructurado y con Docker casi listo, pero hay **varios puntos críticos** que impiden que funcione correctamente al levantar con `docker compose` y que deben corregirse antes de producción.

---

## Lo que está bien

- **Estructura**: Backend (Express + Prisma), frontend (React + Vite), BD PostgreSQL con scripts de init.
- **Autenticación**: JWT, bcrypt, roles (DOCENTE/ADMIN), cambio de contraseña y recuperación por correo.
- **Base de datos**: Esquema SQL en `SGCA_DB/initdb/` (01_schema, 02_seed, 03_restore_test_accounts), compatible con Prisma. La columna `must_change_password` se añade en `03_restore_test_accounts.sql`.
- **API**: Rutas protegidas con `requireAuth` y `requireRole`, health en `/api/health`, subida de archivos con multer (límite 10 MB).
- **Frontend**: Cliente API con `VITE_API_URL`, fallback a `http://localhost:4000`.
- **Seguridad básica**: `.env` en `.gitignore`, validación de UUID en archivos, manejo de errores en auth.
- **Docker**: `docker-compose` con db (healthcheck), backend, frontend, pgAdmin; red `sgca_network` y volúmenes.

---

## Problemas críticos (bloquean el despliegue)

### 1. Falta `DATABASE_URL` en `.env`

El backend usa `env("DATABASE_URL")` en Prisma. Si en tu `.env` solo tienes `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y no tienes `DATABASE_URL`, el backend **no arranca** (Prisma no puede conectar).

**Solución:** Añadir en `.env` (ajustando usuario/contraseña/BD si cambiaste los valores):

```env
DATABASE_URL=postgresql://user:password@db:5432/bd
```

(Reemplaza `user`, `password` y `bd` por los mismos valores que `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`.)

---

### 2. Backend escucha en el puerto equivocado en Docker

En `backend/src/index.js` el puerto es `process.env.PORT || 3000`. En `docker-compose.yml` el servicio `backend` no define `PORT` y se expone `4000:4000`. El proceso escucha en **3000** dentro del contenedor y en **4000** no hay nada; las peticiones al API fallan.

**Solución:** Definir `PORT=4000` para el servicio `backend` en `docker-compose.yml` (o mapear `4000:3000` y dejar que use 3000). Lo recomendable es fijar `PORT=4000` en el servicio.

---

### 3. `VITE_API_URL` con `http://backend:4000` no sirve en el navegador

En `.env.example` (y en tu `.env`) aparece `VITE_API_URL=http://backend:4000`. Esa variable se “hornea” en el build del frontend y el código se ejecuta **en el navegador del usuario**. El navegador no resuelve el hostname `backend` (solo existe dentro de la red Docker). Resultado: el frontend no puede llamar al API.

**Solución:**

- **Con Docker y acceso por `localhost`:** usar en `.env` (o en el build del frontend) `VITE_API_URL=http://localhost:4000` para que el navegador haga las peticiones a tu máquina.
- **En producción (dominio público):** usar la URL pública del API, por ejemplo `VITE_API_URL=https://tu-api.ejemplo.com`.

---

## Problemas importantes (producción / buenas prácticas)

### 4. Frontend en Docker usa servidor de desarrollo

En `Dockerfile.frontend` el CMD es `npm run dev` (Vite en modo dev). Para producción conviene hacer **build** (`npm run build`) y servir los estáticos con nginx o `serve`. No bloquea un primer despliegue, pero no es adecuado para tráfico real.

### 5. JWT y credenciales por defecto

- `.env.example` y muchos entornos de desarrollo usan `JWT_SECRET=change_me_...`. En producción debe ser un secreto fuerte y único.
- pgAdmin en `docker-compose` tiene `PGADMIN_DEFAULT_PASSWORD: admin`. En producción hay que cambiar la contraseña o no exponer pgAdmin.

### 6. CORS abierto

El backend usa `app.use(cors())` sin restricción de origen. En producción es mejor limitar `origin` a la URL del frontend (por ejemplo `https://tu-front.ejemplo.com`).

### 7. Credenciales de prueba en README

El README muestra usuarios/contraseñas de prueba. Asegúrate de no usar esas mismas cuentas en producción o de cambiarlas en cuanto el sistema esté en vivo.

---

## Cómo desplegar (después de aplicar las correcciones)

### Opción A: Docker Compose (local o VPS)

1. Copiar `.env.example` a `.env` y completar/ajustar:
   - `DATABASE_URL=postgresql://POSTGRES_USER:POSTGRES_PASSWORD@db:5432/POSTGRES_DB`
   - `PORT=4000` (o que el backend use 4000 vía variable en el servicio).
   - Para que el navegador llegue al API: `VITE_API_URL=http://localhost:4000` (o la URL pública si ya tienes dominio).
   - `JWT_SECRET` fuerte y único.
2. Asegurarse de que en `docker-compose` el servicio `backend` tenga `PORT=4000` (o el mapeo de puertos coherente).
3. Levantar: `docker compose up -d`.
4. Frontend: `http://localhost:3000`, API: `http://localhost:4000`.

### Opción B: Plataforma tipo Railway

- Backend: Dockerfile en raíz (o `backend/Dockerfile`) que expone el puerto que asigne Railway (por ejemplo `process.env.PORT`).
- Base de datos: Crear Postgres en Railway y configurar `DATABASE_URL`; ejecutar una sola vez los scripts de `SGCA_DB/initdb/` (01, 02, 03) contra esa BD.
- Frontend: Build con `VITE_API_URL=https://url-publica-del-backend` y desplegar el `dist/` (o servicio estático).
- Variables de entorno en Railway: `DATABASE_URL`, `JWT_SECRET`, y en el build del frontend `VITE_API_URL`.

---

## Checklist pre-despliegue

- [ ] `.env` con `DATABASE_URL` coherente con Postgres.
- [ ] Backend en Docker escuchando en el mismo puerto que expone el contenedor (p. ej. `PORT=4000`).
- [ ] `VITE_API_URL` apuntando a una URL que el **navegador** pueda usar (localhost o dominio público).
- [ ] `JWT_SECRET` fuerte en producción.
- [ ] (Opcional) CORS restringido al origen del frontend.
- [ ] (Opcional) Frontend en producción servido por build estático, no `npm run dev`.
- [ ] (Opcional) pgAdmin con contraseña segura o no expuesto en producción.

---

## Conclusión

Con las correcciones de **DATABASE_URL**, **PORT del backend** y **VITE_API_URL** el proyecto queda listo para desplegar con Docker Compose. Para producción real, conviene además endurecer JWT, CORS, build del frontend y gestión de credenciales (incluidas las de pgAdmin y las de prueba del README).
