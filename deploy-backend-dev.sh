#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

cd "$BACKEND_DEV_PATH"

source "$NVM_PATH"
nvm use 20.17.0

echo "Pulling latest changes..."
git pull origin dev

echo "Installing dependencies..."
npm install

echo "Restarting server..."
pm2 restart "$BACKEND_DEV_PM2_NAME"

echo "Done"
