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

# Exponer puerto 4000
EXPOSE 4000

# Iniciar - asegurarse de que escuche en 0.0.0.0
CMD ["npm", "start"]


