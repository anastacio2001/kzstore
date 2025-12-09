#!/bin/bash
# Script para corrigir produtos no Google Merchant Center

export DB_HOST="127.0.0.1"
export DB_PORT="3307"
export DB_NAME="kzstore_prod"
export DB_USER="kzstore_app"
export DB_PASSWORD="Kzstore2024!"

node fix-google-merchant-products.js
