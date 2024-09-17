FROM node:22-alpine

WORKDIR /app

COPY packages/api/dist /app/dist
COPY packages/ui/dist /app/dist/static

ENV NODE_ENV=production
ENV PORT=5696
ENV PREFIX=/api/bundle
EXPOSE 5696

CMD [ "node", "--enable-source-maps", "dist/main.cjs" ]
