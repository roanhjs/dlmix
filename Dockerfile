# Etapa base: utiliza una imagen oficial de Node.js
FROM node:22.18.0-slim

# Configura las variables de entorno para pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Instala ffmpeg (y limpia el cache de apt para reducir tamaño)
RUN apt-get update && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Habilita corepack para gestionar pnpm
RUN corepack enable

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de pnpm y el package.json
COPY pnpm-lock.yaml package.json ./

# Instala las dependencias de producción
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Copia el resto de los archivos de la aplicación
COPY . .

# Instala Playwright con las dependencias necesarias
RUN pnpx playwright install --with-deps --only-shell chromium

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando por defecto para iniciar la aplicación
CMD ["pnpm", "start"]
