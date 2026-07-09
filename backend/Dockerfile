FROM node:24-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

ENV PORT=8000
EXPOSE 8000
RUN npx prisma generate
CMD ["npm", "start"]