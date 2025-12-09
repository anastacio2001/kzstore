#!/usr/bin/env python3
"""
Migração seletiva MySQL → Neon PostgreSQL
Migra apenas campos que existem em ambos os schemas
"""

import mysql.connector
import psycopg2
from datetime import datetime
import sys

# Configurações MySQL (Cloud SQL via Proxy)
MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3307,
    'user': 'kzstore_app',
    'password': 'Kzstore2024!',
    'database': 'kzstore_prod',
    'charset': 'utf8mb4'
}

# Configurações PostgreSQL (Neon)
POSTGRES_CONFIG = {
    'host': 'ep-patient-bonus-aghbwx76-pooler.c-2.eu-central-1.aws.neon.tech',
    'port': 5432,
    'user': 'neondb_owner',
    'password': 'npg_SQ7slkhE8HrG',
    'database': 'neondb',
    'sslmode': 'require'
}

# Mapeamento: tabela MySQL → (tabela Neon, campos permitidos)
TABLE_MAPPINGS = {
    'users': {
        'target': 'users',
        'fields': ['id', 'name', 'email', 'password', 'telefone', 'role', 'email_verified', 'created_at', 'updated_at']
    },
    'team_members': {
        'target': 'team_members',
        'fields': ['id', 'name', 'role', 'department', 'email', 'permissions', 'is_active', 'created_at', 'updated_at']
    },
    'categories': {
        'target': 'categories',
        'fields': ['id', 'name', 'slug', 'description', 'icon', 'image', 'order', 'parent_id', 'created_at', 'updated_at']
    },
    'subcategories': {
        'target': 'subcategories',
        'fields': ['id', 'name', 'slug', 'category_id', 'description', 'icon', 'created_at', 'updated_at']
    },
    'products': {
        'target': 'products',
        'fields': ['id', 'nome', 'descricao', 'preco', 'preco_anterior', 'preco_usd', 'preco_anterior_usd', 
                  'categoria', 'subcategoria', 'marca', 'estoque', 'imagem_url', 'imagem_url_v2',
                  'is_featured', 'is_new_arrival', 'is_flash_sale', 'flash_sale_end', 'discount_percentage',
                  'warranty_info', 'installments', 'pre_order', 'pre_order_date', 'specifications',
                  'created_at', 'updated_at']
    },
    'orders': {
        'target': 'orders',
        'fields': ['id', 'user_id', 'nome', 'email', 'telefone', 'endereco', 'provincia', 'cidade',
                  'payment_method', 'shipping_method', 'coupon_code', 'discount_amount',
                  'total', 'total_usd', 'status', 'payment_status', 'tracking_number',
                  'items', 'created_at', 'updated_at']
    },
    'quotes': {
        'target': 'quotes',
        'fields': ['id', 'name', 'email', 'phone', 'message', 'status', 'admin_notes', 'created_at', 'updated_at']
    },
    'tickets': {
        'target': 'tickets',
        'fields': ['id', 'user_id', 'subject', 'category', 'priority', 'status', 'description',
                  'attachment_url', 'admin_response', 'created_at', 'updated_at']
    },
    'whatsapp_messages': {
        'target': 'whatsapp_messages',
        'fields': ['id', 'to_number', 'message_content', 'status', 'error_message', 'sent_at', 'created_at']
    },
    'blog_posts': {
        'target': 'blog_posts',
        'fields': ['id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'author_id',
                  'category', 'tags', 'status', 'views_count', 'likes_count', 'created_at', 'updated_at']
    }
}

def connect_mysql():
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_postgres():
    return psycopg2.connect(**POSTGRES_CONFIG)

def convert_value(value):
    """Converte valores MySQL para PostgreSQL"""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, (bytes, bytearray)):
        return value.decode('utf-8', errors='replace')
    return value

def migrate_table(mysql_conn, postgres_conn, mysql_table, config):
    """Migra uma tabela com campos seletivos"""
    target_table = config['target']
    fields = config['fields']
    
    print(f"\n📦 Migrando: {mysql_table} → {target_table}")
    
    try:
        mysql_cursor = mysql_conn.cursor(dictionary=True)
        postgres_cursor = postgres_conn.cursor()
        
        # Verificar se há dados
        mysql_cursor.execute(f"SELECT COUNT(*) as total FROM `{mysql_table}`")
        total = mysql_cursor.fetchone()['total']
        
        if total == 0:
            print("   ⏭️  Vazia, pulando...")
            mysql_cursor.close()
            postgres_cursor.close()
            return True
        
        print(f"   📊 {total} registros encontrados")
        
        # Buscar dados (apenas os campos que existem)
        fields_str = ', '.join([f'`{f}`' for f in fields])
        mysql_cursor.execute(f"SELECT {fields_str} FROM `{mysql_table}`")
        
        migrated = 0
        failed = 0
        
        while True:
            rows = mysql_cursor.fetchmany(100)
            if not rows:
                break
            
            for row in rows:
                try:
                    # Preparar INSERT
                    cols = []
                    vals = []
                    placeholders = []
                    
                    for field in fields:
                        if field in row:
                            cols.append(f'"{field}"')
                            vals.append(convert_value(row[field]))
                            placeholders.append('%s')
                    
                    if not cols:
                        continue
                    
                    insert_sql = f"""
                        INSERT INTO "{target_table}" ({','.join(cols)})
                        VALUES ({','.join(placeholders)})
                    """
                    
                    postgres_cursor.execute(insert_sql, vals)
                    postgres_conn.commit()
                    migrated += 1
                    
                except Exception as e:
                    failed += 1
                    if failed <= 3:  # Mostrar apenas primeiros 3 erros
                        print(f"   ⚠️  Erro: {str(e)[:100]}")
        
        print(f"   ✅ {migrated} registros migrados! ({failed} falharam)")
        
        mysql_cursor.close()
        postgres_cursor.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Erro fatal: {e}")
        return False

def main():
    print("🚀 Migração seletiva MySQL → Neon PostgreSQL\n")
    print("=" * 60)
    
    mysql_conn = None
    postgres_conn = None
    
    try:
        # Conectar
        print("\n🔌 Conectando ao MySQL...")
        mysql_conn = connect_mysql()
        print("   ✅ Conectado!")
        
        print("\n🔌 Conectando ao Neon PostgreSQL...")
        postgres_conn = connect_postgres()
        print("   ✅ Conectado!")
        
        # Migrar cada tabela
        success = 0
        failed = []
        
        for mysql_table, config in TABLE_MAPPINGS.items():
            try:
                if migrate_table(mysql_conn, postgres_conn, mysql_table, config):
                    success += 1
                else:
                    failed.append(mysql_table)
            except Exception as e:
                print(f"\n❌ Erro crítico em {mysql_table}: {e}")
                failed.append(mysql_table)
        
        # Resumo final
        print("\n" + "=" * 60)
        print(f"\n✅ Migração concluída!")
        print(f"   📊 {success}/{len(TABLE_MAPPINGS)} tabelas migradas")
        
        if failed:
            print(f"\n   ⚠️  Tabelas com problemas: {', '.join(failed)}")
        
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        sys.exit(1)
        
    finally:
        if mysql_conn:
            mysql_conn.close()
        if postgres_conn:
            postgres_conn.close()

if __name__ == "__main__":
    main()
