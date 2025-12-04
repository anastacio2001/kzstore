#!/bin/bash
# Script para executar queries SQL sem digitar senha toda hora
# Uso: ./db-query.sh "SELECT * FROM products LIMIT 5;"

QUERY="$1"

if [ -z "$QUERY" ]; then
    echo "Uso: ./db-query.sh \"SELECT * FROM products;\""
    exit 1
fi

export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"

# Envia a query com a senha automaticamente
echo "$QUERY" | gcloud sql connect kzstore-01 --user=root <<< "g6=Ua+8<q+{ZeFeP"
