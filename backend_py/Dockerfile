FROM python:3.12-slim

WORKDIR /app

# Install LibreOffice and dependencies for PDF conversion
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
