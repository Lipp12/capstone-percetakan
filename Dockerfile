FROM node:20-alpine

# Install library pendukung untuk Prisma di Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package manifests & prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install semua dependensi (termasuk typescript & tailwindcss untuk proses build)
RUN npm ci --include=dev

# Copy seluruh source code proyek
COPY . .

# Generate Prisma Client & compile Next.js production build
RUN npx prisma generate
RUN npm run build

# Pangkas devDependencies setelah build selesai agar image ringan
RUN npm prune --omit=dev

# Set NODE_ENV ke production untuk runtime
ENV NODE_ENV=production

# Siapkan direktori upload berkas
RUN mkdir -p /app/public/uploads/products /app/public/uploads/designs /app/public/uploads/payments

EXPOSE 3000

CMD ["npm", "start"]
