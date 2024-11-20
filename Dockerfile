# -------------
FROM node:20-alpine AS build

#ENV NODE_ENV production

# Backend
WORKDIR /usr/src/chasse-au-tresor-backend
ENV NODE_ENV=build

COPY chasse-au-tresor-backend/package*.json ./
RUN npm ci

COPY chasse-au-tresor-backend/src ./src
COPY chasse-au-tresor-backend/tsconfig.json ./
RUN npm run build
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force



# Frontend
WORKDIR /usr/src/chasse-au-tresor-frontend
ENV NODE_ENV=build

COPY chasse-au-tresor-frontend/package*.json ./
RUN npm ci

COPY chasse-au-tresor-frontend/src ./src
COPY chasse-au-tresor-frontend/tsconfig*.json ./
COPY chasse-au-tresor-frontend/angular.json ./
RUN npm run build
ENV NODE_ENV=production
RUN npm ci --only=production --omit-dev && npm cache clean --force

# -------------
FROM node:20-alpine AS runtime

# switch to europe timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Paris /etc/localtime

WORKDIR /usr/src

COPY --from=build /usr/src/chasse-au-tresor-backend/node_modules  chasse-au-tresor-backend/node_modules
COPY --from=build /usr/src/chasse-au-tresor-backend/dist  chasse-au-tresor-backend/dist

COPY --from=build /usr/src/chasse-au-tresor-frontend/dist/chasse-au-tresor-frontend/browser chasse-au-tresor-frontend/dist

ENV PORT=3000
ENV LOG_LEVEL=DEBUG

VOLUME ["/frontend", "/data"]
EXPOSE 3000

#CMD mv chasse-au-tresor-frontend/dist/* /frontend && node chasse-au-tresor-backend/dist/main.js

COPY --chmod=755 <<EOT /entrypoint.sh
#!/usr/bin/env bash
set -e
mv chasse-au-tresor-frontend/dist/* /frontend && node chasse-au-tresor-backend/dist/main.js
EOT

ENTRYPOINT ["/entrypoint.sh"]
