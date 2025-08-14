# Imagen base con Node
FROM node:22

# Carpeta de trabajo
WORKDIR /app

# Instalar dependencias primero
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente Prisma dentro de la imagen
RUN npx prisma generate

# Exponer puerto
EXPOSE 4000

# Iniciar (en dev)
CMD ["npm", "run", "dev"]