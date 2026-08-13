FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/node/package.json apps/node/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspace=apps/node --workspace=packages/shared --include-workspace-root

COPY apps/node apps/node
COPY packages/shared packages/shared

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER node
CMD ["npm", "run", "start", "--workspace=apps/node"]
