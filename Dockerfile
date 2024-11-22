# Start with Node.js base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Start with Python base image for the final stage
FROM ubuntu:22.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV CLICKHOUSE_URL=http://host.docker.internal:8123
ENV USE_OPENMP=1

# Install Node.js, Python, and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    libopenblas-dev \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get install -y nodejs 


# Set working directory
WORKDIR /app

# Copy built Next.js application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Python application
COPY py-embed ./py-embed

WORKDIR /app/py-embed

# Install Python dependencies
RUN pip3 install -r requirements.txt

WORKDIR /app

# Expose port for Next.js
EXPOSE 8080

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Start both applications
CMD ["./start.sh"]