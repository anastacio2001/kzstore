#!/bin/bash

# Script para aplicar melhorias do blog ao banco de dados
# Executa migration no Cloud SQL ou local

echo "🚀 Aplicando melhorias do blog ao banco de dados..."
echo "================================================"
echo ""

# Verificar se o arquivo de migration existe
if [ ! -f "migrations/blog-improvements.sql" ]; then
  echo "❌ Erro: Arquivo migrations/blog-improvements.sql não encontrado"
  exit 1
fi

# Perguntar qual banco usar
echo "Qual banco de dados deseja atualizar?"
echo "1) Produção (Cloud SQL)"
echo "2) Local (localhost)"
read -p "Escolha (1 ou 2): " choice

if [ "$choice" = "1" ]; then
  echo ""
  echo "📡 Conectando ao Cloud SQL (Produção)..."
  
  # Verificar se gcloud está instalado
  if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não está instalado"
    exit 1
  fi

  # Executar migration no Cloud SQL
  gcloud sql connect kzstore-01 --user=kzstore_user --database=kzstore_prod < migrations/blog-improvements.sql

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration aplicada com sucesso no Cloud SQL!"
  else
    echo ""
    echo "❌ Erro ao aplicar migration no Cloud SQL"
    exit 1
  fi

elif [ "$choice" = "2" ]; then
  echo ""
  echo "💻 Conectando ao banco local..."
  
  # Pedir credenciais locais
  read -p "Usuário MySQL (padrão: root): " mysql_user
  mysql_user=${mysql_user:-root}
  
  read -sp "Senha MySQL: " mysql_pass
  echo ""
  
  read -p "Database (padrão: kzstore_prod): " mysql_db
  mysql_db=${mysql_db:-kzstore_prod}
  
  # Executar migration localmente
  mysql -u "$mysql_user" -p"$mysql_pass" "$mysql_db" < migrations/blog-improvements.sql

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration aplicada com sucesso localmente!"
  else
    echo ""
    echo "❌ Erro ao aplicar migration localmente"
    exit 1
  fi

else
  echo "❌ Opção inválida"
  exit 1
fi

echo ""
echo "================================================"
echo "🎉 Melhorias do blog instaladas com sucesso!"
echo ""
echo "📋 Novas funcionalidades disponíveis:"
echo "  ✅ Sistema de comentários com threads"
echo "  ✅ Analytics avançado de leitura"
echo "  ✅ Compartilhamento social com tracking"
echo "  ✅ Buscas avançadas"
echo "  ✅ Artigos relacionados"
echo "  ✅ Newsletter popups"
echo "  ✅ Likes em posts e comentários"
echo ""
echo "🚀 Próximo passo: Build e deploy da aplicação"
echo "   npm run build && gcloud run deploy"
echo ""
