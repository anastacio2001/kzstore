# Production stage - Use Node 22 for Fly.io
FROM node:22-slim

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including tsx for running TypeScript)
RUN npm ci

# Copy all source code
COPY . .

# Generate Prisma Client (força regeneração com schema atualizado)
RUN rm -rf node_modules/.prisma node_modules/@prisma/client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build only frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p public/uploads

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start server with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "server.ts"]
