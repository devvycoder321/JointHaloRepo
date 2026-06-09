# Halo deployment package

This package is ready to deploy the backend to cPanel, a Linux VPS, or another Node.js host.

## What is included
- Backend entrypoint at halo-system/backend/server.js
- Production-friendly environment template at deployment/.env.production.example
- Startup script at deployment/start.sh
- cPanel deployment hook at .cpanel.yml

## Quick deploy steps
1. Copy the repository to the target server.
2. Create a production environment file from deployment/.env.production.example.
3. Install the backend dependencies:
   - cd halo-system/backend
   - npm install --omit=dev
4. Start the app with:
   - bash ../../deployment/start.sh

## Required environment values
Set these before starting the app:
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_API_KEY
- AZURE_OPENAI_DEPLOYMENT
- AZURE_OPENAI_API_VERSION

## cPanel notes
- Point the Node app root to halo-system/backend.
- Start command: bash ../../deployment/start.sh
- Make sure the application listens on the assigned cPanel port.
