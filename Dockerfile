# Dockerfile for Railway - Build from backend
FROM node:22

WORKDIR /app

# Copiar solo los package*.json del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código del backend
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generar cliente Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 4000

# Iniciar
CMD ["npm", "start"]
