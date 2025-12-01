#!/bin/sh

# Start Cloud SQL Proxy in background
cloud_sql_proxy -instances=$CLOUD_SQL_CONNECTION_NAME=tcp:3306 &

# Wait for proxy to be ready
sleep 3

# Start the application
exec node dist/backend/server.js
