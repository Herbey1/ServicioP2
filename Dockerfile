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

# Exponer puerto 3000 (Railway lo mapea automáticamente)
EXPOSE 3000

# Iniciar directamente con node
CMD ["node", "src/index.js"]


