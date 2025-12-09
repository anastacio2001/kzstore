#!/bin/bash
# Script para migrar dados via mysqldump e conversão

echo "🔄 Exportando apenas dados (INSERTs) do MySQL..."

# Exportar apenas os INSERTs (sem CREATE TABLE)
gcloud sql export sql kzstore-01 gs://kzstore-backups-202512/data-only-$(date +%Y%m%d-%H%M%S).sql \
  --database=kzstore_prod \
  --table=users,team_members,products,orders,order_items,coupons,flash_sales,customers,ads,reviews,tickets,pre_orders,trade_ins,quotes,affiliates,newsletter,whatsapp_messages,cron_jobs,hero_settings,categories,subcategories,footer_settings,blog_posts,blog_comments,blog_shares,blog_searches,blog_newsletter_popups,blog_post_related,blog_post_tags

echo "✅ Exportação concluída!"
echo "📥 Baixando arquivo..."

# Pegar o nome do arquivo mais recente
LATEST_FILE=$(gsutil ls -l gs://kzstore-backups-202512/data-only-*.sql | sort -k2 -r | head -n1 | awk '{print $3}')

gsutil cp "$LATEST_FILE" ./data-only.sql

echo "✅ Dados exportados para data-only.sql"
