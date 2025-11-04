# Imagen base con Node
FROM node:22

# Carpeta de trabajo - IMPORTANTE: debe ser /app para Railway
WORKDIR /app

# Copiar solo los package*.json del backend
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del backend
COPY . .

# Generar cliente Prisma dentro de la imagen
RUN npx prisma generate

# Exponer puerto
EXPOSE 4000

# Iniciar según el ambiente
CMD ["npm", "run", "start"]