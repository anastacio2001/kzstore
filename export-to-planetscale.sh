#!/bin/bash

# 🚀 Script de Exportação para PlanetScale

echo "🔄 Iniciando exportação do banco de dados..."

# 1. Exportar do Cloud SQL
echo "📦 Exportando do Cloud SQL..."
EXPORT_FILE="export-to-planetscale-$(date +%Y%m%d-%H%M%S).sql"

gcloud sql export sql kzstore-01 \
  "gs://kzstore-backups-202512/$EXPORT_FILE" \
  --database=kzstore_prod

if [ $? -eq 0 ]; then
    echo "✅ Exportação concluída: $EXPORT_FILE"
    
    # 2. Baixar para local
    echo "📥 Baixando arquivo..."
    gsutil cp "gs://kzstore-backups-202512/$EXPORT_FILE" ~/Desktop/
    
    if [ $? -eq 0 ]; then
        echo "✅ Arquivo salvo em: ~/Desktop/$EXPORT_FILE"
        echo ""
        echo "🎯 Próximos passos:"
        echo "1. Crie conta no PlanetScale: https://auth.planetscale.com/sign-up"
        echo "2. Crie database: kzstore-prod (região: AWS Frankfurt)"
        echo "3. Me avise para continuarmos a importação!"
    else
        echo "❌ Erro ao baixar arquivo"
    fi
else
    echo "❌ Erro na exportação"
fi
