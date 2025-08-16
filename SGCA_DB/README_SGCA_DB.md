
# SGCA - Base de Datos lista para usar (Docker + PostgreSQL 15)

## Archivos incluidos
- `docker-compose.sgca.yml`
- `.env.sgca`
- `initdb/01_schema.sql`
- `initdb/02_seed.sql`

## Cómo iniciar
1. Asegúrate de tener Docker instalado.
2. Coloca estos archivos en una carpeta vacía y, desde esa carpeta, ejecuta:
   ```bash
   docker compose -f docker-compose.sgca.yml --env-file .env.sgca up -d
   ```
3. Espera a que el contenedor quede **healthy**. La DB queda lista con:
   - DB: ${POSTGRES_DB}
   - USER: ${POSTGRES_USER}
   - PASS: ${POSTGRES_PASSWORD}
   - Puerto local: ${PGPORT}

## Credenciales admin para la app
- **Usuario**: `admin@uabc.edu.mx`
- **Password**: `WkdbdY45LFtvoBdhfcGkGQ`
## Credenciales docente para la app
  - **Usuario**: `docente@uabc.edu.mx`
  - **Password**: `Docente123!`

> *Nota:* estas credenciales son de ejemplo para desarrollo. Cambia la contraseña en cuanto conectes el backend.

## Conexión (psql)
```bash
psql "postgresql://sgca_user:sgca_password_123@localhost:5432/sgca"
```

