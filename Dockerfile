FROM node:22-alpine

WORKDIR /app

COPY packages/api/dist/ /app/
COPY packages/desktop/dist/ /app/static/

ENV NODE_ENV=production
ENV PORT=5696
ENV PREFIX=/api/bundle
EXPOSE 5696

CMD [ "node", "--enable-source-maps", "main.cjs" ]
