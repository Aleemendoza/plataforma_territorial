FROM node:20-alpine

WORKDIR /app

COPY apps/web/package*.json ./

RUN npm install

COPY apps/web ./

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
