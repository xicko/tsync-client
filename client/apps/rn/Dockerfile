FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN npm install -g serve

WORKDIR /web

COPY . .

RUN pnpm install --frozen-lockfile

WORKDIR /web/apps/rn

ARG EXPO_PUBLIC_BASE_API_URL
ARG EXPO_PUBLIC_ONESIGNAL_APPID
ENV EXPO_PUBLIC_BASE_API_URL=$EXPO_PUBLIC_BASE_API_URL EXPO_PUBLIC_ONESIGNAL_APPID=$EXPO_PUBLIC_ONESIGNAL_APPID

RUN pnpm exec expo export --platform web

EXPOSE 80

CMD ["serve", "-s", "./dist", "-l", "80"]
