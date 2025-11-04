# Dockerfile for Railway - Build from backend
FROM node:22

WORKDIR /app

# Copiar solo los package*.json del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el código del backend
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generar cliente Prisma
RUN npx prisma generate

# Exponer puerto 4000 (Railway lo mapeará automáticamente)
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Iniciar - asegurarse de que escuche en 0.0.0.0
CMD ["npm", "start"]

