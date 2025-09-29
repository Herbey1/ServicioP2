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
   - `JWT_SECRET`
   - `REACT_APP_API_URL` (por defecto apunta al backend en Docker)

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
