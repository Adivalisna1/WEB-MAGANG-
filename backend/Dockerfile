FROM node:20-alpine

WORKDIR /app

# Install dependencies dulu (layer cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Buat folder uploads kalau belum ada
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "src/index.js"]
