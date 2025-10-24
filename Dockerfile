FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nodejs
RUN mkdir -p /app/data && \
  chown -R nodejs:nodejs /app/data
COPY --from=build /app/.output ./
USER nodejs
EXPOSE 3000
CMD ["node", "server/index.mjs"]
