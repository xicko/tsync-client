FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN npm install -g serve

WORKDIR /web

COPY . .

RUN pnpm install --frozen-lockfile

WORKDIR /web/apps/rn

RUN pnpm exec expo export --platform web

EXPOSE 80

CMD ["serve", "-s", "./dist", "-l", "80"]
