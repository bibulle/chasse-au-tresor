# -------------
FROM node:20-alpine AS BUILD

#ENV NODE_ENV production

# Backend
WORKDIR /usr/src/chasse-au-tresor-backend
ENV NODE_ENV build

COPY chasse-au-tresor-backend/package*.json ./
RUN npm ci

COPY chasse-au-tresor-backend/src ./src
COPY chasse-au-tresor-backend/tsconfig.json ./
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force



# Frontend
WORKDIR /usr/src/chasse-au-tresor-frontend
ENV NODE_ENV build

COPY chasse-au-tresor-frontend/package*.json ./
RUN npm ci

COPY chasse-au-tresor-frontend/src ./src
COPY chasse-au-tresor-frontend/tsconfig*.json ./
COPY chasse-au-tresor-frontend/angular.json ./
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production --omit-dev && npm cache clean --force


# Packaging
# WORKDIR /usr/src/apps
# COPY apps/frontend apps/frontend
# COPY apps/chasse-au-tresor-frontend apps/api

# RUN npx nx run-many --parallel --target=build --configuration=production --projects=frontend,api 
# #RUN npm run ng build frontend -- --prod
# #RUN npm run ng build api -- --prod

# # -------------
FROM node:20-alpine AS RUNTIME

# switch to europe timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Paris /etc/localtime

WORKDIR /usr/src

COPY --from=BUILD /usr/src/chasse-au-tresor-backend/node_modules  chasse-au-tresor-backend/node_modules
COPY --from=BUILD /usr/src/chasse-au-tresor-backend/dist  chasse-au-tresor-backend/dist

COPY --from=BUILD /usr/src/chasse-au-tresor-frontend/dist chasse-au-tresor-frontend/dist

# RUN npm ci --only=production --ignore-scripts --omit=dev
# RUN npm uninstall sqlite3 sharp
# RUN npm install sqlite3 sharp

ENV PORT=3000
ENV LOG_LEVEL=DEBUG

VOLUME ["/frontend"]
EXPOSE 3000

# #CMD mv dist/apps/frontend/* dist/apps/frontend/.htaccess /frontend && node dist/apps/api/main.js
CMD mv chasse-au-tresor-frontend/dist/* /frontend && node chasse-au-tresor-backend/dist/main.js