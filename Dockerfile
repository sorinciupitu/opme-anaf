# Etapa 1: Instalarea dependențelor
FROM node:20-alpine AS deps
# Verifică https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine pentru posibile probleme de compilare a modulelor native
WORKDIR /app

# Copiază fișierele de management al pachetelor
COPY package.json ./

# Instalează dependențele
RUN npm install

# Etapa 2: Construirea aplicației
FROM node:20-alpine AS builder
WORKDIR /app
# Copiază dependențele din etapa anterioară
COPY --from=deps /app/node_modules ./node_modules
# Copiază restul codului sursă
COPY . .

# Construiește aplicația pentru producție
RUN npm run build

# Etapa 3: Rularea în producție
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Creează un utilizator non-root pentru o securitate sporită
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiază artefactele de build necesare
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Schimbă utilizatorul la cel non-root
USER nextjs

# Expune portul pe care rulează aplicația Next.js
EXPOSE 3000

# Setează variabila de mediu PORT
ENV PORT 3000

# Comanda pentru a porni serverul Next.js
CMD ["npm", "start"]
