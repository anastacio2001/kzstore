#!/bin/bash

# Script para monitorar propagação DNS e SSL do kzstore.ao

echo "🔍 Monitorando propagação DNS e provisionamento SSL..."
echo "═══════════════════════════════════════════════════════════"
echo ""

TARGET_IP="34.54.61.190"
CHECK_INTERVAL=60  # Verificar a cada 60 segundos

dns_propagated=false
ssl_active=false

while true; do
    echo "⏰ $(date '+%H:%M:%S')"
    echo ""
    
    # Verificar DNS
    echo "📡 Verificando DNS..."
    current_ip=$(nslookup kzstore.ao 8.8.8.8 | grep "Address:" | tail -1 | awk '{print $2}')
    
    if [ "$current_ip" == "$TARGET_IP" ]; then
        if [ "$dns_propagated" = false ]; then
            echo "✅ DNS PROPAGADO! kzstore.ao → $TARGET_IP"
            dns_propagated=true
        else
            echo "✅ DNS OK: $TARGET_IP"
        fi
    else
        echo "⏳ DNS propagando... (atual: $current_ip, esperado: $TARGET_IP)"
    fi
    
    echo ""
    
    # Verificar SSL
    echo "🔐 Verificando certificado SSL..."
    ssl_status=$(gcloud compute ssl-certificates describe kzstore-cert --global --format="value(managed.status)" 2>/dev/null)
    
    if [ "$ssl_status" == "ACTIVE" ]; then
        if [ "$ssl_active" = false ]; then
            echo "✅ SSL ATIVO! Certificado provisionado com sucesso!"
            ssl_active=true
            
            echo ""
            echo "╔══════════════════════════════════════════════════════╗"
            echo "║  🎉 DOMÍNIO CONFIGURADO E PRONTO PARA USO!          ║"
            echo "╚══════════════════════════════════════════════════════╝"
            echo ""
            echo "🌐 Acessa agora:"
            echo "   https://kzstore.ao"
            echo "   https://www.kzstore.ao"
            echo ""
            
            # Testar acesso
            echo "🧪 Testando acesso..."
            curl -sI https://kzstore.ao | head -5
            
            echo ""
            echo "✨ Tudo pronto! O teu e-commerce está no ar!"
            break
        else
            echo "✅ SSL ATIVO"
        fi
    else
        echo "⏳ SSL Status: $ssl_status (aguardando DNS propagar)"
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "⏰ Próxima verificação em $CHECK_INTERVAL segundos..."
    echo ""
    
    sleep $CHECK_INTERVAL
done
