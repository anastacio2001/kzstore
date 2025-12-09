#!/usr/bin/env python3
"""
Script de migração MySQL → PostgreSQL (Neon)
Migra todos os dados respeitando foreign keys e tipos de dados
"""

import mysql.connector
import psycopg2
from psycopg2.extras import execute_values
import json
from datetime import datetime
import sys

# Configurações
MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3307,
    'user': 'kzstore_app',
    'password': 'Kzstore2024!',
    'database': 'kzstore_prod',
    'charset': 'utf8mb4'
}

POSTGRES_CONFIG = {
    'host': 'ep-patient-bonus-aghbwx76-pooler.c-2.eu-central-1.aws.neon.tech',
    'port': 5432,
    'user': 'neondb_owner',
    'password': 'npg_SQ7slkhE8HrG',
    'database': 'neondb',
    'sslmode': 'require'
}

# Ordem de migração (respeita foreign keys)
TABLES_ORDER = [
    'users',
    'team_members',
    'categories',
    'subcategories',
    'hero_settings',
    'footer_settings',
    'products',
    'products_shipping_backup',
    'customers',
    'orders',
    'order_items',
    'coupons',
    'flash_sales',
    'ads',
    'reviews',
    'pre_orders',
    'trade_ins',
    'quotes',
    'affiliates',
    'newsletter',
    'cron_jobs',
    'whatsapp_messages',
    'tickets',
    'blog_posts',
    'blog_comments',
    'blog_shares',
    'blog_searches',
    'blog_newsletter_popups',
    'blog_post_related',
    'blog_post_tags'
]

def connect_mysql():
    """Conectar ao MySQL"""
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_postgres():
    """Conectar ao PostgreSQL"""
    return psycopg2.connect(**POSTGRES_CONFIG)

def convert_value(value, column_type):
    """Converter valores MySQL para PostgreSQL"""
    if value is None:
        return None
    
    # Converter bytes para string
    if isinstance(value, bytes):
        return value.decode('utf-8')
    
    # Converter datetime
    if isinstance(value, datetime):
        return value
    
    # Converter booleanos (tinyint(1) no MySQL)
    if column_type in ['TINYINT', 'BOOLEAN'] and isinstance(value, int):
        return bool(value)
    
    # JSON já vem como string no MySQL
    if column_type == 'JSON':
        if isinstance(value, str):
            try:
                json.loads(value)  # Validar JSON
                return value
            except:
                return json.dumps(value)
        return json.dumps(value)
    
    return value

def get_table_columns(mysql_cursor, table_name):
    """Obter colunas e tipos da tabela"""
    mysql_cursor.execute(f"DESCRIBE {table_name}")
    columns = []
    types = {}
    for row in mysql_cursor.fetchall():
        col_name = row[0]
        col_type = row[1].decode('utf-8') if isinstance(row[1], bytes) else row[1]
        columns.append(col_name)
        types[col_name] = col_type
    return columns, types

def migrate_table(mysql_conn, postgres_conn, table_name):
    """Migrar uma tabela completa"""
    mysql_cursor = mysql_conn.cursor()
    postgres_cursor = postgres_conn.cursor()
    
    print(f"\n📦 Migrando tabela: {table_name}")
    
    try:
        # Obter estrutura da tabela
        columns, types = get_table_columns(mysql_cursor, table_name)
        
        # Contar registros
        mysql_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total_rows = mysql_cursor.fetchone()[0]
        
        if total_rows == 0:
            print(f"   ⏭️  Vazia, pulando...")
            return True
        
        print(f"   📊 {total_rows} registros encontrados")
        
        # Buscar dados
        mysql_cursor.execute(f"SELECT * FROM {table_name}")
        rows = mysql_cursor.fetchall()
        
        # Preparar INSERT
        placeholders = ','.join(['%s'] * len(columns))
        column_names = ','.join([f'"{col}"' for col in columns])
        insert_query = f'INSERT INTO "{table_name}" ({column_names}) VALUES ({placeholders})'
        
        # Inserir em lotes de 100
        batch_size = 100
        migrated = 0
        
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            converted_batch = []
            
            for row in batch:
                converted_row = []
                for j, value in enumerate(row):
                    col_type = types[columns[j]]
                    converted_value = convert_value(value, col_type)
                    converted_row.append(converted_value)
                converted_batch.append(tuple(converted_row))
            
            # Inserir batch
            try:
                for converted_row in converted_batch:
                    postgres_cursor.execute(insert_query, converted_row)
                postgres_conn.commit()
                migrated += len(converted_batch)
                print(f"   ✓ {migrated}/{total_rows} registros migrados", end='\r')
            except Exception as e:
                print(f"\n   ⚠️  Erro no batch: {e}")
                postgres_conn.rollback()
                # Tentar inserir um por um
                for converted_row in converted_batch:
                    try:
                        postgres_cursor.execute(insert_query, converted_row)
                        postgres_conn.commit()
                        migrated += 1
                    except Exception as row_error:
                        print(f"\n   ❌ Erro na linha: {row_error}")
                        postgres_conn.rollback()
        
        print(f"\n   ✅ {migrated} registros migrados com sucesso!")
        
        # Resetar sequences (AUTO_INCREMENT)
        if 'id' in columns:
            try:
                postgres_cursor.execute(f"""
                    SELECT setval(pg_get_serial_sequence('"{table_name}"', 'id'), 
                                  (SELECT MAX(id) FROM "{table_name}"), true)
                """)
                postgres_conn.commit()
            except:
                pass  # Tabela pode não ter sequence
        
        return True
        
    except Exception as e:
        print(f"\n   ❌ Erro na tabela {table_name}: {e}")
        return False
    finally:
        mysql_cursor.close()
        postgres_cursor.close()

def main():
    print("🚀 Iniciando migração MySQL → PostgreSQL (Neon)\n")
    print("=" * 60)
    
    mysql_conn = None
    postgres_conn = None
    
    try:
        # Conectar aos bancos
        print("\n🔌 Conectando ao MySQL...")
        mysql_conn = connect_mysql()
        print("   ✅ Conectado!")
        
        print("\n🔌 Conectando ao Neon PostgreSQL...")
        postgres_conn = connect_postgres()
        print("   ✅ Conectado!")
        
        # Migrar cada tabela
        success_count = 0
        failed_tables = []
        
        for table in TABLES_ORDER:
            try:
                if migrate_table(mysql_conn, postgres_conn, table):
                    success_count += 1
                else:
                    failed_tables.append(table)
            except Exception as e:
                print(f"\n❌ Erro crítico na tabela {table}: {e}")
                failed_tables.append(table)
        
        # Reabilitar triggers
        postgres_cursor = postgres_conn.cursor()
        postgres_cursor.execute("SET session_replication_role = DEFAULT;")
        postgres_conn.commit()
        postgres_cursor.close()
        
        # Resumo
        print("\n" + "=" * 60)
        print("\n📊 RESUMO DA MIGRAÇÃO:")
        print(f"   ✅ Sucesso: {success_count}/{len(TABLES_ORDER)} tabelas")
        
        if failed_tables:
            print(f"   ❌ Falhas: {len(failed_tables)} tabelas")
            print(f"   Tabelas com erro: {', '.join(failed_tables)}")
        else:
            print("\n🎉 MIGRAÇÃO COMPLETA COM SUCESSO!")
        
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
