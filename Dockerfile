# Production stage - Use Node 22 for Fly.io
FROM node:22-slim

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with timeout settings
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy all source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript (compilar backend)
RUN npx tsc -p tsconfig.backend.json || true

# Build frontend
RUN npm run build || echo "Frontend build optional"

# Create uploads directory
RUN mkdir -p public/uploads

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start server (usar dist compilado se existir, senão tsx)
CMD ["sh", "-c", "if [ -f dist/backend/server.js ]; then node dist/backend/server.js; else npx tsx server.ts; fi"]
