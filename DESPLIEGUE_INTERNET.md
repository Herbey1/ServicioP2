# Guía de despliegue en Internet – SGCA

Esta guía detalla **qué falta** y **cómo desplegar** el sistema para que profesores y administradores puedan usarlo desde internet.

---

## Estado actual: ¿qué está listo?

| Componente | Estado |
|------------|--------|
| Backend (API) | ✅ Listo |
| Frontend (React) | ✅ Listo (build producción + nginx) |
| Base de datos PostgreSQL | ✅ Listo |
| Autenticación (login, JWT) | ✅ Listo |
| Recuperación de contraseña | ✅ Listo (encola emails) |
| Email worker (envío real) | ✅ Añadido a Docker |
| Docker Compose | ✅ Listo |

---

## Lo que falta para desplegar en internet

### 1. Elegir dónde desplegar

Tienes dos caminos principales:

| Opción | Dificultad | Costo | Recomendado para |
|--------|------------|-------|------------------|
| **Railway** | Baja | ~$5/mes (tier gratuito limitado) | Proyectos académicos, MVP |
| **VPS** (DigitalOcean, Linode, etc.) | Media | ~$5–12/mes | Control total, producción seria |

### 2. Variables de entorno para producción

Antes de desplegar, configura estas variables con **URLs públicas**:

```env
# URLs públicas (reemplaza con tus dominios o URLs de Railway)
VITE_API_URL=https://tu-backend.railway.app
FRONTEND_URL=https://tu-frontend.railway.app

# Seguridad
JWT_SECRET=genera-un-secreto-largo-y-aleatorio-aqui

# CORS: origen del frontend
CORS_ORIGIN=https://tu-frontend.railway.app

# Email (para recuperación de contraseña real)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password-de-gmail
EMAIL_FROM=no-reply@tu-dominio.com
EMAIL_FROM_NAME=SGCA
```

> **Gmail:** Para usar Gmail como SMTP, crea una "Contraseña de aplicación" en tu cuenta de Google (no uses tu contraseña normal).

### 3. Credenciales de prueba → producción

Las cuentas en `SGCA_DB/initdb/03_restore_test_accounts.sql` son:

- `admin@uabc.edu.mx` / contraseña por defecto
- `docente@uabc.edu.mx` / contraseña por defecto

**En producción debes:**

1. Cambiar las contraseñas inmediatamente al entrar, o
2. Editar `03_restore_test_accounts.sql` antes del primer despliegue para usar contraseñas seguras, o
3. Eliminar esas cuentas y crear nuevas desde el panel de administrador.

### 4. pgAdmin en producción

En `docker-compose.yml`, pgAdmin está expuesto en el puerto 8081. **En producción:**

- No expongas pgAdmin a internet, o
- Cámbialo a un puerto no estándar y usa contraseña fuerte, o
- Comenta/elimina el servicio `pgadmin` del compose de producción.

---

## Opción A: Desplegar en Railway

Railway ofrece base de datos PostgreSQL, backend y frontend. Tu `.env.production` ya apunta a Railway.

### Paso 1: Crear proyecto en Railway

1. Entra a [railway.app](https://railway.app) y crea un proyecto.
2. Añade un servicio **PostgreSQL** (Railway te dará `DATABASE_URL`).
3. Ejecuta los scripts de inicialización contra esa BD:
   - Conecta con un cliente (pgAdmin, DBeaver, `psql`) a la URL que te da Railway.
   - Ejecuta en orden: `01_schema.sql`, `02_seed.sql`, `03_restore_test_accounts.sql` (desde `SGCA_DB/initdb/`).

### Paso 2: Desplegar el backend

1. Crea un servicio **Web Service** en Railway.
2. Conecta tu repositorio Git (o sube el código).
3. Configura el **root directory** como `backend` (o usa el `Dockerfile` en `backend/`).
4. Variables de entorno:
   - `DATABASE_URL` (la que te da Railway para Postgres)
   - `JWT_SECRET` (secreto fuerte)
   - `PORT` (Railway lo asigna automáticamente, suele ser `process.env.PORT`)
   - `FRONTEND_URL` = URL pública del frontend (la tendrás después del paso 3)
   - `CORS_ORIGIN` = misma URL del frontend
   - Opcional: `SMTP_*` para emails reales

5. Railway te dará una URL como `https://xxx.up.railway.app`. **Guárdala** para el frontend.

### Paso 3: Desplegar el frontend

1. Crea otro servicio en Railway (o usa **Static Site** si está disponible).
2. Root directory: raíz del proyecto (donde está `package.json` del frontend).
3. Build command: `npm run build`
4. Output directory: `dist`
5. **Variable de entorno en el build:** `VITE_API_URL=https://tu-backend.up.railway.app` (la URL del paso 2).
6. Railway te dará una URL para el frontend.

### Paso 4: Email worker (opcional)

Para que la recuperación de contraseña envíe emails reales:

- Crea un **tercer servicio** en Railway que ejecute `npm run send-emails` desde la carpeta `backend`.
- Usa las mismas variables que el backend (`DATABASE_URL`, `SMTP_*`).
- O integra el worker dentro del backend con un intervalo (menos ideal pero más simple).

### Paso 5: Actualizar URLs

Una vez tengas las URLs finales:

- En el backend: `FRONTEND_URL` y `CORS_ORIGIN` con la URL del frontend.
- Reconstruye el frontend con `VITE_API_URL` apuntando al backend.

---

## Opción B: Desplegar en VPS (Docker)

Si tienes un VPS (Ubuntu, etc.) con Docker:

### Paso 1: Preparar el servidor

```bash
# Instalar Docker y Docker Compose
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

### Paso 2: Clonar y configurar

```bash
git clone <tu-repo> ServicioP2
cd ServicioP2
cp .env.example .env
```

Edita `.env` con:

- `VITE_API_URL=https://api.tudominio.com` (o la IP si no tienes dominio)
- `FRONTEND_URL=https://tudominio.com`
- `DATABASE_URL=postgresql://user:password@db:5432/bd`
- `JWT_SECRET` fuerte
- `CORS_ORIGIN=https://tudominio.com`
- SMTP si quieres emails reales

### Paso 3: Levantar con Docker

```bash
docker compose up -d --build
```

### Paso 4: Nginx inverso (HTTPS)

Para HTTPS con Let's Encrypt, usa nginx o Caddy como proxy inverso:

- `tudominio.com` → frontend (puerto 3000)
- `api.tudominio.com` → backend (puerto 4000)

Ejemplo mínimo con Caddy (automático HTTPS):

```
tudominio.com {
    reverse_proxy localhost:3000
}
api.tudominio.com {
    reverse_proxy localhost:4000
}
```

### Paso 5: pgAdmin

En producción, no expongas pgAdmin o restringe el acceso por firewall.

---

## Checklist final antes de ir a producción

- [ ] `JWT_SECRET` es un valor aleatorio fuerte (mín. 32 caracteres).
- [ ] `VITE_API_URL` y `FRONTEND_URL` son las URLs públicas correctas.
- [ ] `CORS_ORIGIN` incluye la URL del frontend.
- [ ] Las contraseñas de las cuentas de prueba están cambiadas o eliminadas.
- [ ] pgAdmin no está expuesto o tiene contraseña segura.
- [ ] SMTP configurado si quieres recuperación de contraseña por email real.
- [ ] Base de datos inicializada con los scripts de `SGCA_DB/initdb/`.

---

## Flujo esperado una vez desplegado

1. **Profesor (DOCENTE):** Entra con su correo @uabc.edu.mx, crea solicitudes y reportes.
2. **Administrador (ADMIN):** Entra, revisa solicitudes/reportes, aprueba o rechaza, gestiona usuarios.
3. **Recuperación de contraseña:** Si SMTP está configurado, el profesor recibe el email con el enlace; si no, el enlace aparece en los logs del email-worker (solo desarrollo).

---

## Resumen de archivos modificados para despliegue

- `.env` / `.env.example`: `DATABASE_URL`, `PORT`, `VITE_API_URL`, `FRONTEND_URL`, variables SMTP.
- `docker-compose.yml`: backend con `PORT=4000`, frontend con build nginx, **email-worker** añadido.
- `Dockerfile.frontend`: build de producción con nginx.
- `backend/src/index.js`: CORS configurable con `CORS_ORIGIN`.
