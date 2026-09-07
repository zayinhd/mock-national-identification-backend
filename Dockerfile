FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libgif-dev \
    libpango1.0-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]