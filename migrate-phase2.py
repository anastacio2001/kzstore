#!/usr/bin/env python3
"""
Migração FASE 2 - Tabelas restantes
Newsletter, Ads, ShippingZones, Profiles, etc.
"""

import mysql.connector
import psycopg2
from datetime import datetime
import json
import sys

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

def connect_mysql():
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_postgres():
    return psycopg2.connect(**POSTGRES_CONFIG)

def migrate_newsletter(mysql_conn, postgres_conn):
    """Migra NewsletterSubscriber"""
    print("\n📧 Migrando NEWSLETTER...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM NewsletterSubscriber")
        rows = mysql_cur.fetchall()
        
        if not rows:
            print("   ⏭️  Vazia")
            return True
        
        print(f"   📊 {len(rows)} subscribers")
        
        migrated = 0
        for row in rows:
            try:
                postgres_cur.execute("""
                    INSERT INTO "NewsletterSubscriber" (
                        id, email, name, status,
                        subscribed_at, unsubscribed_at, source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row['email'],
                    row.get('name'),
                    row.get('status', 'active'),
                    row.get('subscribed_at'),
                    row.get('unsubscribed_at'),
                    row.get('source', 'website')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro {row.get('email')}: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_advertisements(mysql_conn, postgres_conn):
    """Migra banners/anúncios"""
    print("\n🎯 Migrando ADVERTISEMENTS (Banners)...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM advertisements WHERE ativo = 1")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} banners ativos")
        
        migrated = 0
        for row in rows:
            try:
                postgres_cur.execute("""
                    INSERT INTO advertisements (
                        id, titulo, descricao, imagem_url_v2,
                        link_url, posicao, tipo, ativo,
                        data_inicio, data_fim, criado_por,
                        criado_em, atualizado_em
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('titulo'),
                    row.get('descricao'),
                    row.get('imagem_url_v2'),
                    row.get('link_url'),
                    row.get('posicao', 'home-hero'),
                    row.get('tipo', 'banner'),
                    bool(row.get('ativo', 1)),
                    row.get('created_at', datetime.now()),
                    row.get('data_fim'),
                    'admin',
                    row.get('created_at', datetime.now()),
                    row.get('updated_at', datetime.now())
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro {row.get('titulo')}: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} banners migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_customer_profiles(mysql_conn, postgres_conn):
    """Migra perfis de clientes"""
    print("\n👥 Migrando CUSTOMER PROFILES...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM customer_profiles")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} perfis")
        
        migrated = 0
        for row in rows:
            try:
                # Processar preferences e endereco
                preferences = row.get('preferences')
                if preferences and isinstance(preferences, str):
                    try:
                        preferences = json.loads(preferences)
                    except:
                        preferences = {}
                
                endereco = row.get('endereco')
                if endereco and isinstance(endereco, str):
                    try:
                        endereco = json.loads(endereco)
                    except:
                        endereco = {}
                
                postgres_cur.execute("""
                    INSERT INTO customer_profiles (
                        id, auth_user_id, nome, email, telefone,
                        endereco, preferences, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('auth_user_id'),
                    row.get('nome'),
                    row.get('email'),
                    row.get('telefone'),
                    json.dumps(endereco) if endereco else None,
                    json.dumps(preferences) if preferences else None,
                    row.get('created_at'),
                    row.get('updated_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro {row.get('email')}: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} perfis migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_favorites(mysql_conn, postgres_conn):
    """Migra favoritos"""
    print("\n⭐ Migrando FAVORITES...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM favorites")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} favoritos")
        
        migrated = 0
        for row in rows:
            try:
                postgres_cur.execute("""
                    INSERT INTO favorites (
                        id, user_id, product_id, created_at
                    ) VALUES (%s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row['user_id'],
                    row['product_id'],
                    row.get('created_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} favoritos migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_activity_logs(mysql_conn, postgres_conn):
    """Migra logs de atividade (últimos 100)"""
    print("\n📝 Migrando ACTIVITY LOGS (últimos 100)...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} logs recentes")
        
        migrated = 0
        for row in rows:
            try:
                # Processar metadata
                metadata = row.get('metadata')
                if metadata and isinstance(metadata, str):
                    try:
                        metadata = json.loads(metadata)
                    except:
                        metadata = {}
                
                postgres_cur.execute("""
                    INSERT INTO activity_logs (
                        id, user_id, user_name, user_role,
                        action_type, entity_type, entity_id,
                        description, metadata, ip_address,
                        created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('user_id'),
                    row.get('user_name'),
                    row.get('user_role'),
                    row.get('action_type'),
                    row.get('entity_type'),
                    row.get('entity_id'),
                    row.get('description'),
                    json.dumps(metadata) if metadata else None,
                    row.get('ip_address'),
                    row.get('created_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                if migrated == 0:  # Mostrar só primeiro erro
                    print(f"   ⚠️  Erro: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} logs migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_whatsapp_messages(mysql_conn, postgres_conn):
    """Migra mensagens WhatsApp"""
    print("\n💬 Migrando WHATSAPP MESSAGES...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM whatsapp_messages")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} mensagens")
        
        migrated = 0
        for row in rows:
            try:
                # Processar metadata
                metadata = row.get('metadata')
                if metadata and isinstance(metadata, str):
                    try:
                        metadata = json.loads(metadata)
                    except:
                        metadata = {}
                
                postgres_cur.execute("""
                    INSERT INTO whatsapp_messages (
                        id, message_sid, "to", "from",
                        template_sid, body, status,
                        error_code, error_message, metadata,
                        created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('message_sid'),
                    row.get('to'),
                    row.get('from'),
                    row.get('template_sid'),
                    row.get('body'),
                    row.get('status', 'sent'),
                    row.get('error_code'),
                    row.get('error_message'),
                    json.dumps(metadata) if metadata else None,
                    row.get('created_at', datetime.now()),
                    row.get('created_at', datetime.now())
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro: {str(e)[:60]}")
        
        print(f"   ✅ {migrated}/{len(rows)} mensagens migradas!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def main():
    print("🚀 MIGRAÇÃO FASE 2 - Dados Restantes\n")
    print("=" * 80)
    
    mysql_conn = None
    postgres_conn = None
    
    try:
        print("\n🔌 Conectando...")
        mysql_conn = connect_mysql()
        postgres_conn = connect_postgres()
        print("   ✅ Conectado!")
        
        results = {}
        
        # Migrar cada tabela
        results['newsletter'] = migrate_newsletter(mysql_conn, postgres_conn)
        results['advertisements'] = migrate_advertisements(mysql_conn, postgres_conn)
        results['customer_profiles'] = migrate_customer_profiles(mysql_conn, postgres_conn)
        results['favorites'] = migrate_favorites(mysql_conn, postgres_conn)
        results['activity_logs'] = migrate_activity_logs(mysql_conn, postgres_conn)
        results['whatsapp_messages'] = migrate_whatsapp_messages(mysql_conn, postgres_conn)
        
        # Resumo
        print("\n" + "=" * 80)
        print("\n✅ FASE 2 CONCLUÍDA!\n")
        
        success = sum(1 for v in results.values() if v)
        total = len(results)
        
        print(f"📊 Resultado: {success}/{total} tabelas migradas\n")
        
        for table, status in results.items():
            emoji = "✅" if status else "❌"
            print(f"   {emoji} {table}")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"\n❌ ERRO FATAL: {e}")
        sys.exit(1)
        
    finally:
        if mysql_conn:
            mysql_conn.close()
        if postgres_conn:
            postgres_conn.close()

if __name__ == "__main__":
    main()
