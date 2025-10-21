#!/bin/bash

set -e

echo "🚀 Iniciando deploy de ServicioP2..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Verificar que existe el archivo de configuración de producción
if [ ! -f ".env.production" ]; then
    error "Archivo .env.production no encontrado"
    warn "Copia .env.production.example y configura las variables de producción"
    exit 1
fi

# Verificar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    exit 1
fi

log "✅ Verificaciones iniciales completadas"

# Limpiar contenedores de desarrollo
info "🧹 Limpiando contenedores de desarrollo..."
docker-compose -f docker-compose.yml down --volumes --remove-orphans || true

# Construir imágenes de producción
log "🔨 Construyendo imágenes de producción..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Ejecutar migraciones de base de datos
log "🗄️ Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.prod.yml up -d db
sleep 10  # Esperar a que la DB esté lista

# Ejecutar Prisma migrations si existen
log "📋 Ejecutando migraciones Prisma..."
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy || warn "No hay migraciones pendientes"

# Verificar seed de datos
log "🌱 Verificando datos iniciales..."
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db seed || warn "No hay seed script configurado"

# Iniciar todos los servicios
log "🚀 Iniciando servicios de producción..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
log "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar salud de los servicios
log "🔍 Verificando salud de los servicios..."

# Backend health check
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando correctamente"
else
    error "❌ Backend no responde"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Frontend health check
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend está funcionando correctamente"
else
    error "❌ Frontend no responde"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Mostrar estado final
log "📊 Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps

log "🎉 Deploy completado exitosamente!"
info "📱 Aplicación disponible en: http://localhost"
info "🔧 Para ver logs: docker-compose -f docker-compose.prod.yml logs -f"
info "⏹️  Para detener: docker-compose -f docker-compose.prod.yml down"

# Mostrar credenciales de prueba
echo ""
info "👤 Credenciales de prueba disponibles:"
echo "   📧 Email: test@uabc.edu.mx"
echo "   🔐 Password: test123"
echo "   👤 Rol: ADMIN"