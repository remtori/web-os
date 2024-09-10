FROM node:22-alpine as builder

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm install

COPY esbuild.js ./
COPY src/ ./src

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /build/dist /app/dist

ENV NODE_ENV=production
ENV PORT=5696
ENV PREFIX=/api/bundle
EXPOSE 5696

CMD [ "node", "--enable-source-maps", "dist/main.cjs" ]
