# 🚀 Guía de Deploy - Sistema ServicioP2

## 📋 Pre-requisitos

- [x] Docker y Docker Compose instalados
- [x] Puerto 80 disponible (para frontend)
- [x] Puerto 443 disponible (para HTTPS, opcional)
- [x] Al menos 2GB de RAM disponible
- [x] 5GB de espacio en disco

## 🔧 Configuración de Producción

### 1. Configurar Variables de Entorno

```bash
# Copiar y editar el archivo de configuración de producción
cp .env.production.example .env.production
nano .env.production
```

**Variables críticas a cambiar:**
- `POSTGRES_PASSWORD`: Contraseña fuerte para la base de datos
- `JWT_SECRET`: Secreto fuerte para JWT (mínimo 512 bits)
- `NODE_ENV=production`

### 2. Configurar SSL (Opcional pero Recomendado)

Para producción con SSL, agregar certificados en `./ssl/`:
```
ssl/
├── cert.pem
└── privkey.pem
```

## 🚀 Deploy Automático

### Opción 1: Script Automático (Recomendado)
```bash
./deploy.sh
```

### Opción 2: Deploy Manual
```bash
# 1. Detener servicios de desarrollo
docker-compose down --volumes

# 2. Construir imágenes de producción
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Verificación Post-Deploy

### Verificar Servicios
```bash
# Estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Health checks
curl http://localhost/api/health    # Backend
curl http://localhost              # Frontend
```

### Verificar Base de Datos
```bash
# Conectar a la base de datos
docker-compose -f docker-compose.prod.yml exec db psql -U sgca_prod_user -d sgca_prod

# Verificar usuarios
docker-compose -f docker-compose.prod.yml exec db psql -U sgca_prod_user -d sgca_prod -c "SELECT correo, nombre, rol FROM usuarios;"
```

## 👤 Credenciales de Prueba

### Usuario Administrador de Prueba
- **Email:** `test@uabc.edu.mx`
- **Password:** `test123`
- **Rol:** `ADMIN`

### Usuarios por Defecto (Seeds)
- **Admin:** `admin@uabc.edu.mx` (password desconocido)
- **Docente:** `docente@uabc.edu.mx` (password desconocido)

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Rebuild y restart
docker-compose -f docker-compose.prod.yml up -d --build

# Eliminar todo (incluyendo volúmenes)
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
```

### Monitoreo
```bash
# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f db

# Ver uso de recursos
docker stats

# Ejecutar comando en contenedor
docker-compose -f docker-compose.prod.yml exec backend /bin/sh
```

### Backup y Restore
```bash
# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec db pg_dump -U sgca_prod_user sgca_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore de base de datos
docker-compose -f docker-compose.prod.yml exec -T db psql -U sgca_prod_user sgca_prod < backup_file.sql
```

## 🔒 Consideraciones de Seguridad

### Aplicadas en Producción:
- ✅ Contraseñas fuertes configurables
- ✅ JWT secret fuerte
- ✅ Contenedores sin privilegios
- ✅ Base de datos no expuesta externamente
- ✅ Headers de seguridad en Nginx
- ✅ Health checks configurados
- ✅ Logs centralizados

### Recomendaciones Adicionales:
- [ ] Configurar firewall (ufw/iptables)
- [ ] Configurar SSL/TLS con Let's Encrypt
- [ ] Configurar backup automático
- [ ] Configurar monitoreo (Prometheus/Grafana)
- [ ] Configurar alertas
- [ ] Configurar rate limiting
- [ ] Configurar log rotation

## 🐛 Troubleshooting

### Problemas Comunes:

#### Frontend no carga
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs frontend

# Verificar puerto
netstat -tlnp | grep :80
```

#### Backend no responde
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend

# Verificar conexión a DB
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

#### Base de datos no conecta
```bash
# Verificar estado de DB
docker-compose -f docker-compose.prod.yml exec db pg_isready -U sgca_prod_user

# Verificar logs de DB
docker-compose -f docker-compose.prod.yml logs db
```

#### Error de autenticación JWT
```bash
# Verificar JWT_SECRET en .env.production
# Limpiar localStorage del navegador
# Verificar logs del backend
```

## 📊 URLs de Acceso

- **Aplicación Principal:** http://localhost
- **API Health Check:** http://localhost/api/health  
- **HTTPS (si configurado):** https://localhost

## 🔄 Actualizaciones

Para actualizar el sistema:
```bash
# 1. Hacer backup
./deploy.sh backup

# 2. Pull cambios
git pull

# 3. Rebuild y deploy
./deploy.sh
```