# Gunakan slim (Debian-based) bukan alpine — LibreOffice tidak tersedia di Alpine
FROM node:20-slim

WORKDIR /app

# Install LibreOffice untuk konversi Word/Excel → PDF saat preview
# + font Microsoft-compatible supaya layout tidak berantakan
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    fonts-liberation \
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies dulu (layer cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Buat folder uploads dan tmp kalau belum ada
RUN mkdir -p /app/uploads /tmp/lo_preview

EXPOSE 5000

CMD ["node", "src/index.js"]
