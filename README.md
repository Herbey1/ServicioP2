# Guía de despliegue del sistema

Este proyecto permite levantar un entorno completo con base de datos, backend y frontend para el Sistema de Gestión de Comisiones Académicas (SGCA).

## Requisitos previos

- **Docker** y **Docker Compose** instalados.
- Puertos libres: `3000` (frontend), `4000` (backend) y `5432` (PostgreSQL, configurable).
- Opcional: un cliente PostgreSQL para inspeccionar la base de datos.

---

## 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd ServicioP2
```

---

## 2. Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Si lo deseas, edita `.env` para ajustar:
   - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PGPORT`
   - `PORT` (backend escucha por defecto en `4000`)
   - `JWT_SECRET`
   - `VITE_API_URL` (por defecto `http://backend:4000` para Docker)

   Si ejecutas el frontend directamente con `npm run dev`, crea un `.env.local` con
   `VITE_API_URL=http://localhost:4000` para seguir apuntando al backend local.

---

## 3. Levantar los servicios

```bash
docker compose up -d
```

Esto construirá y arrancará tres contenedores:

| Servicio  | Puerto local | Descripción                                 |
|-----------|--------------|---------------------------------------------|
| db        | `PGPORT`     | PostgreSQL con datos iniciales (`initdb`)   |
| backend   | `4000`       | API Express + Prisma                        |
| frontend  | `3000`       | Aplicación React                            |

> El contenedor `backend` espera a que la base de datos esté **healthy** antes de iniciar.

---

## 4. Verificar el estado

- Logs en tiempo real:
  ```bash
  docker compose logs -f
  ```
- Listar contenedores activos:
  ```bash
  docker ps
  ```

---

## 5. Acceder a la aplicación

- **Frontend:** <http://localhost:3000>
- **Backend (API):** <http://localhost:4000>
- **Base de datos:** `postgresql://sgca_user:sgca_password_123@localhost:PGPORT/sgca`
- **Credenciales de ejemplo** (solo para desarrollo):
  - Usuario: `admin@uabc.edu.mx`
  - Password: `WkdbdY45LFtvoBdhfcGkGQ`

  - Usuario: `docente@uabc.edu.mx`
  - Password: `Docente123!`

---

## 6. Apagar los servicios

```bash
docker compose down
```

> Añade `-v` para borrar el volumen de datos:
> ```bash
> docker compose down -v
> ```

---

## 7. (Opcional) Ejecutar solo la base de datos

Dentro de `SGCA_DB/` hay un stack mínimo:

```bash
cd SGCA_DB
docker compose -f docker-compose.sgca.yml --env-file .env.sgca up -d
```

Esto levanta únicamente PostgreSQL con los mismos datos iniciales.

---

## 8. Migraciones (Prisma Migrate)

Para controlar cambios de esquema en producción, se recomienda usar Prisma Migrate en lugar de depender solo de los scripts `initdb`.

- Beneficios:
  - Historial versionado de cambios al esquema
  - Despliegues predecibles con `prisma migrate deploy`
  - Sincronía asegurada entre `schema.prisma` y la base de datos

### Adopción desde una BD ya existente (baseline)

1) Asegúrate de que `schema.prisma` refleje la BD actual.
   - Si hiciste cambios manuales en SQL, primero sincroniza el cliente: `npm --prefix backend run prisma:pull`.

2) Genera un script baseline a partir de la BD actual (no aplica cambios, solo crea el SQL de referencia):

```bash
cd backend
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/000_baseline/migration.sql
```

3) Marca esta migración como aplicada (sin ejecutarla):

```bash
cd backend
npx prisma migrate resolve --applied 000_baseline
```

Comandos listos para copiar y pegar (Linux/Mac/WSL):

```bash
export DATABASE_URL=$(grep ^DATABASE_URL= ../.env | cut -d'=' -f2-)
cd backend
mkdir -p prisma/migrations/000_baseline
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/000_baseline/migration.sql
npx prisma migrate resolve --applied 000_baseline
```

En PowerShell (Windows):

```powershell
$env:DATABASE_URL = (Select-String -Path ../.env -Pattern '^DATABASE_URL=').Line.Split('=')[1]
Set-Location backend
New-Item -ItemType Directory -Force -Path prisma/migrations/000_baseline | Out-Null
npx prisma migrate diff --from-url "$env:DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/000_baseline/migration.sql
npx prisma migrate resolve --applied 000_baseline
```

A partir de aquí, cualquier cambio de modelo se hace con:

- Desarrollo: `npm run prisma:migrate:dev` (crea y aplica una nueva migración)
- Producción/CI: `npm run prisma:migrate:deploy`

### Consideraciones con `initdb`

- Entorno local: puedes seguir utilizando `SGCA_DB/initdb` para poblar una instancia nueva.
- Producción: evita montar `./SGCA_DB/initdb` para no mezclar dos orígenes de verdad. En su lugar, confía en `prisma migrate deploy`.
  - Si usas `docker-compose.yml` para producción, quita o comenta la línea de volumen `./SGCA_DB/initdb:/docker-entrypoint-initdb.d` del servicio `db`.

### Comandos útiles

- `npm --prefix backend run prisma:migrate:status` — estado de migraciones
- `npm --prefix backend run prisma:migrate:deploy` — aplica migraciones pendientes (prod)
- `npm --prefix backend run prisma:migrate:dev` — crea y aplica una nueva migración (dev)
- `npm --prefix backend run prisma:gen` — regenera el cliente de Prisma

---

## 9. Despliegue de producción (docker-compose.prod.yml)

Este archivo levanta un entorno de producción con:

- `db`: Postgres sin scripts `initdb` (la estructura se aplica con Prisma Migrate)
- `backend`: aplica migraciones (`prisma migrate deploy`) y arranca en `PORT=4000`
- `frontend`: construye y sirve los estáticos con `vite preview` en `3000`

Comandos básicos:

```bash
# 1) Configurar variables
cp .env.example .env
# Edita .env: JWT_SECRET, VITE_API_URL, y DATABASE_URL (si usas DB gestionada)

# 2) Levantar en modo producción
docker compose -f docker-compose.prod.yml up -d --build

# 3) Ver logs
docker compose -f docker-compose.prod.yml logs -f

# 4) Parar
docker compose -f docker-compose.prod.yml down
```

URLs por defecto:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

Usando base de datos gestionada (recomendado en producción):

- No necesitas el servicio `db`. Ajusta `DATABASE_URL` en `.env` a tu proveedor (añade `sslmode=require` si aplica) y opcionalmente elimina/ignora el servicio `db` del compose de producción.
- El backend seguirá ejecutando `prisma migrate deploy` al arrancar.

Notas:

- No se monta `./SGCA_DB/initdb` en producción para evitar conflictos con migraciones.
- El volumen `uploads` persiste archivos subidos entre despliegues.
