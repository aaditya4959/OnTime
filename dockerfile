# ---------------------------
# 1️⃣ Build stage
# ---------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript → JS
RUN npx tsc


# ---------------------------
# 2️⃣ Runtime stage
# ---------------------------
FROM node:20-alpine
WORKDIR /app

# Copy only dist and production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]

