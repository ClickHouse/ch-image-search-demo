# ch-image-search-demo
This repository contains an example React NextJS application that leverage Clickhouse vector Search capability to implement image similarity search. 

## Prerequisite
- Clickhouse server
- NodeJS LTS
- Python 3.10+

## Architecture

This application has two parts: 
1. Python embedding model
2. ReactJS frontend

## Python embedding model

The Python application is used to generate embeddings for the images. 

### Setup

Install the dependencies:

```bash
cd py-embed
pip install -r requirements.txt
```

Run the application:

```bash
uvicorn app:app --reload
```

## ReactJS application

The ReactJS application is used to stream images from Clickhouse and also perform image similarity search. 

### Setup 

Install the dependencies:

```bash
yarn install
```

Run the application:

```bash
yarn dev
```

Build the application:

```bash
yarn build
```