# Dockerfile

# Etapa 1: Instalarea dependențelor de producție
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Etapa 2: Construirea aplicației
FROM node:20-alpine AS builder
WORKDIR /app
# Copiem dependențele de producție din etapa anterioară
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instalam TOATE dependențele (inclusiv devDependencies) necesare pentru build
# Apoi rulăm build-ul
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install
RUN npm run build

# Etapa 3: Rularea aplicației în producție
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiem doar artefactele de producție din etapa de build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
