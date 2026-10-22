
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY bootstrap.mjs ./
COPY global-bundle.pem /app/global-bundle.pem

USER node

CMD ["node", "bootstrap.mjs"]