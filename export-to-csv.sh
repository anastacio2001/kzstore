#!/bin/bash
# Script para exportar dados do MySQL Cloud SQL para CSVs

echo "📤 Exportando dados do MySQL para formato CSV..."

# Lista de tabelas importantes
TABLES=(
    "users"
    "team_members"
    "products"
    "orders"
    "order_items"
    "customers"
    "coupons"
    "flash_sales"
    "blog_posts"
    "blog_comments"
)

# Criar diretório para CSVs
mkdir -p ./migration-csvs

for TABLE in "${TABLES[@]}"; do
    echo "Exportando $TABLE..."
    
    gcloud sql export csv kzstore-01 \
        "gs://kzstore-backups-202512/csv-export-$TABLE.csv" \
        --database=kzstore_prod \
        --query="SELECT * FROM $TABLE" \
        --quiet
    
    echo "✓ $TABLE exportado"
done

echo ""
echo "✅ Exportação concluída!"
echo "Baixando CSVs..."

gsutil -m cp "gs://kzstore-backups-202512/csv-export-*.csv" ./migration-csvs/

echo "✅ Todos os arquivos baixados para ./migration-csvs/"
