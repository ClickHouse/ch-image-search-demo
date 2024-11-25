#!/bin/bash

# Start Python API in the background
cd py-embed && source venv/bin/activate && uvicorn app:app --port 8000 &

# Start Next.js application
cd /app && npm start -- -p 8080
