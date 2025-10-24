# FROM node:24-alpine AS build
# WORKDIR /app

# COPY .npmrc ./
# COPY package.json ./
# COPY package-lock.json ./

# RUN npm ci

# COPY . ./

# RUN npm run build

# FROM node:24-alpine
# WORKDIR /app

# ENV NODE_ENV=production
# ENV PORT=3000

# COPY --from=build /app/.output ./.output

# EXPOSE 3000

# CMD ["node", ".output/server/index.mjs"]
# FROM node:24-alpine AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci

# FROM node:24-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build

# FROM node:24-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# ENV PORT=3000
# COPY package.json package-lock.json ./
# RUN npm ci --omit=dev
# COPY --from=builder /app/dist ./dist
# EXPOSE 3000
# CMD ["node", "dist/server/server.js"]


FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
