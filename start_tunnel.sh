#!/bin/bash
echo "🚀 Starting ngrok tunnel for port 8000..."
echo "Copy the 'Forwarding' URL (https://....ngrok-free.app) and set it as VITE_API_URL in Vercel."
echo "---------------------------------------------------"
ngrok http 8000
