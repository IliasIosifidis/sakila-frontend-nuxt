# Stage 1: Build the Nuxt app
FROM node:22-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Runtime — only the built output and Node
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /build/.output ./.output
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["node", ".output/server/index.mjs"]