
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./


RUN npm install --ignore-scripts

COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY


RUN npx quasar build --mode spa


FROM nginx:stable-alpine AS production-stage


COPY --from=build-stage /app/dist/spa /usr/share/nginx/html


COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]