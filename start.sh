#!/bin/bash

# Start Python API in the background
cd py-embed && export OPENBLAS_NUM_THREADS=1 && source .env/bin/activate && uvicorn app:app --port 8000 &

# Start Next.js application
yarn build && yarn start
