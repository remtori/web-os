FROM node:22-alpine as builder

# Build client code
COPY package.json package-lock.json ./
RUN npm install

COPY functions/package.json functions/package-lock.json ./functions/
RUN npm install --prefix functions

COPY . .
RUN npm run build

FROM node:22-alpine

USER www

WORKDIR /app

COPY --from=builder /app/dist /app/dist

ENV PORT=5696
ENV PREFIX=/api/bundle
EXPOSE 5696

CMD [ "node", "--enable-source-maps", "dist/main.cjs" ]
