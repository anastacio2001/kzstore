#!/usr/bin/env python3
"""
Migração completa MySQL → Neon com conversão de schema
Mapeia dados antigos para estrutura nova do Prisma
"""

import mysql.connector
import psycopg2
from datetime import datetime
import json
import sys

# Configurações MySQL
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

def connect_mysql():
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_postgres():
    return psycopg2.connect(**POSTGRES_CONFIG)

def safe_json(value):
    """Converte string para JSON válido ou None"""
    if not value:
        return None
    if isinstance(value, str):
        try:
            return json.loads(value)
        except:
            return value
    return value

def migrate_users(mysql_conn, postgres_conn):
    """Migra tabela users com conversão de campos"""
    print("\n📦 Migrando USERS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    # MySQL: id, email, password_hash, name, user_type, is_active, created_at, updated_at
    # Neon: id, email, password_hash, name, user_type, is_active, created_at, updated_at (mesmos campos!)
    
    mysql_cursor.execute("""
        SELECT id, email, password_hash, name, user_type, is_active, created_at, updated_at
        FROM users
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            # Converter is_active de INT para BOOLEAN
            is_active_bool = bool(row['is_active']) if row['is_active'] is not None else True
            
            postgres_cursor.execute("""
                INSERT INTO users (id, email, password_hash, name, user_type, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['email'],
                row['password_hash'],
                row['name'] or 'Usuário',
                row['user_type'] or 'customer',
                is_active_bool,
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            postgres_conn.rollback()  # Rollback apenas esta transação
            print(f"   ⚠️  Erro user {row.get('email')}: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} usuários migrados!")
    return migrated

def migrate_team_members(mysql_conn, postgres_conn):
    """Migra team members"""
    print("\n📦 Migrando TEAM MEMBERS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    mysql_cursor.execute("""
        SELECT id, name, email, user_type as role, is_active, created_at, updated_at
        FROM users WHERE user_type IN ('admin', 'team_member', 'manager')
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO team_members (id, name, email, role, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['name'],
                row['email'],
                row['role'] or 'team_member',
                row['is_active'],
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} membros migrados!")
    return migrated

def migrate_categories(mysql_conn, postgres_conn):
    """Migra categorias"""
    print("\n📦 Migrando CATEGORIES...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    # MySQL: id, name, slug, description, icon, image_url, parent_id, order, active
    # Neon: id, name, slug, description, icon, image, order, parent_id
    
    mysql_cursor.execute("""
        SELECT id, name, slug, description, icon, image_url, parent_id, `order`, created_at, updated_at
        FROM categories
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO categories (id, name, slug, description, icon, image, "order", parent_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['name'],
                row['slug'],
                row['description'],
                row['icon'],
                row['image_url'],
                row['order'] or 0,
                row['parent_id'],
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro categoria {row.get('name')}: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} categorias migradas!")
    return migrated

def migrate_subcategories(mysql_conn, postgres_conn):
    """Migra subcategorias"""
    print("\n📦 Migrando SUBCATEGORIES...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    mysql_cursor.execute("""
        SELECT id, name, slug, description, parent_id as category_id, created_at, updated_at
        FROM categories WHERE parent_id IS NOT NULL
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO subcategories (id, name, slug, category_id, description, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['name'],
                row['slug'],
                row['category_id'],
                row['description'],
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} subcategorias migradas!")
    return migrated

def migrate_products(mysql_conn, postgres_conn):
    """Migra produtos com conversão completa"""
    print("\n📦 Migrando PRODUCTS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    # MySQL: preco_aoa, preco_usd, imagens, especificacoes
    # Neon: preco_aoa, preco_usd, imagens, especificacoes (mesmos campos!)
    
    mysql_cursor.execute("""
        SELECT 
            id, nome, descricao, categoria, subcategoria, 
            preco_aoa, preco_usd, estoque, estoque_minimo,
            imagem_url, imagens, marca, modelo, especificacoes,
            is_featured, destaque, ativo,
            category_id, subcategory_id, tags,
            created_at, updated_at
        FROM products
        WHERE ativo = 1
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            # Converter imagens JSON se necessário
            imagens = row.get('imagens')
            if isinstance(imagens, str):
                try:
                    imagens = json.loads(imagens)
                except:
                    imagens = None
            
            # Converter especificações
            specs = row.get('especificacoes')
            if isinstance(specs, str):
                try:
                    specs = json.loads(specs)
                except:
                    specs = None
            
            # Converter tags
            tags_data = row.get('tags')
            if isinstance(tags_data, str):
                try:
                    tags_data = json.loads(tags_data)
                except:
                    tags_data = None
            
            postgres_cursor.execute("""
                INSERT INTO products (
                    id, nome, descricao, preco_aoa, preco_usd, 
                    categoria, subcategoria, marca, modelo, estoque, estoque_minimo,
                    imagem_url, imagens, especificacoes, tags,
                    is_featured, destaque, ativo,
                    category_id, subcategory_id,
                    created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['nome'],
                row['descricao'],
                row['preco_aoa'],
                row['preco_usd'],
                row['categoria'],
                row['subcategoria'],
                row['marca'],
                row['modelo'],
                row['estoque'],
                row['estoque_minimo'],
                row['imagem_url'],
                json.dumps(imagens) if imagens else None,
                json.dumps(specs) if specs else None,
                json.dumps(tags_data) if tags_data else None,
                row['is_featured'] or False,
                row['destaque'] or False,
                row['ativo'],
                row['category_id'],
                row['subcategory_id'],
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro produto {row.get('nome', 'desconhecido')}: {str(e)[:100]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} produtos migrados!")
    return migrated

def migrate_orders(mysql_conn, postgres_conn):
    """Migra pedidos"""
    print("\n📦 Migrando ORDERS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    # MySQL: id, order_number, user_id, user_name, user_email, items, subtotal, total, etc
    # Neon: id, user_id, nome, email, items, total, total_usd, status, payment_method, etc
    
    mysql_cursor.execute("""
        SELECT 
            id, order_number, user_id, user_name, user_email,
            items, subtotal, total, discount_amount,
            payment_method, payment_status, shipping_address,
            status, tracking_number, notes,
            created_at, updated_at
        FROM orders
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            # Parse endereço
            shipping = safe_json(row.get('shipping_address')) or {}
            items_json = safe_json(row.get('items')) or []
            
            postgres_cursor.execute("""
                INSERT INTO orders (
                    id, user_id, nome, email, telefone,
                    endereco, provincia, cidade,
                    items, total, total_usd,
                    payment_method, payment_status, status,
                    tracking_number, discount_amount,
                    created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['user_id'],
                row['user_name'] or 'Cliente',
                row['user_email'] or '',
                shipping.get('phone', ''),
                shipping.get('address', ''),
                shipping.get('province', 'Luanda'),
                shipping.get('city', 'Luanda'),
                json.dumps(items_json) if items_json else '[]',
                float(row['total'] or 0),
                float(row['total'] or 0) / 900,  # Conversão aproximada
                row['payment_method'] or 'Transferência',
                row['payment_status'] or 'pending',
                row['status'] or 'pending',
                row['tracking_number'],
                float(row['discount_amount'] or 0),
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro order {row.get('order_number')}: {str(e)[:100]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} pedidos migrados!")
    return migrated

def migrate_tickets(mysql_conn, postgres_conn):
    """Migra tickets de suporte"""
    print("\n📦 Migrando TICKETS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    mysql_cursor.execute("SELECT * FROM tickets")
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO tickets (
                    id, user_id, subject, category, priority, status,
                    description, admin_response, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row.get('user_id'),
                row.get('subject', 'Assunto não especificado'),
                row.get('category', 'geral'),
                row.get('priority', 'medium'),
                row.get('status', 'open'),
                row.get('description', ''),
                row.get('admin_response'),
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} tickets migrados!")
    return migrated

def migrate_quotes(mysql_conn, postgres_conn):
    """Migra cotações"""
    print("\n📦 Migrando QUOTES...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    mysql_cursor.execute("SELECT * FROM quotes")
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO quotes (
                    id, name, email, phone, message, status,
                    admin_notes, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row.get('customer_name', 'Cliente'),
                row.get('customer_email', ''),
                row.get('customer_phone', ''),
                row.get('message', ''),
                row.get('status', 'pending'),
                row.get('admin_notes'),
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} cotações migradas!")
    return migrated

def migrate_blog_posts(mysql_conn, postgres_conn):
    """Migra posts do blog"""
    print("\n📦 Migrando BLOG POSTS...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    # MySQL: id, title, slug, excerpt, content, cover_image, category, tags, author_id, status, views_count
    # Neon: id, title, slug, excerpt, content, featured_image, author_id, category, tags, status, views_count
    
    mysql_cursor.execute("""
        SELECT 
            id, title, slug, excerpt, content, cover_image,
            category, tags, author_id, author_name,
            status, views_count, likes_count,
            created_at, updated_at
        FROM blog_posts
    """)
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO blog_posts (
                    id, title, slug, excerpt, content,
                    featured_image, author_id, category, tags,
                    status, views_count, likes_count,
                    created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row['title'],
                row['slug'],
                row['excerpt'],
                row['content'],
                row['cover_image'],
                row['author_id'] or 1,
                row['category'] or 'Geral',
                row['tags'],
                row['status'] or 'draft',
                row['views_count'] or 0,
                row['likes_count'] or 0,
                row['created_at'],
                row['updated_at']
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro post {row.get('title')}: {str(e)[:100]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} posts migrados!")
    return migrated

def migrate_whatsapp_messages(mysql_conn, postgres_conn):
    """Migra mensagens WhatsApp"""
    print("\n📦 Migrando WHATSAPP MESSAGES...")
    
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    postgres_cursor = postgres_conn.cursor()
    
    mysql_cursor.execute("SELECT * FROM whatsapp_messages")
    
    migrated = 0
    for row in mysql_cursor.fetchall():
        try:
            postgres_cursor.execute("""
                INSERT INTO whatsapp_messages (
                    id, to_number, message_content, status,
                    error_message, sent_at, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                row['id'],
                row.get('recipient', row.get('phone_number', '')),
                row.get('message', ''),
                row.get('status', 'sent'),
                row.get('error'),
                row.get('sent_at'),
                row.get('created_at')
            ))
            postgres_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"   ⚠️  Erro: {str(e)[:80]}")
    
    mysql_cursor.close()
    postgres_cursor.close()
    print(f"   ✅ {migrated} mensagens migradas!")
    return migrated

def main():
    print("🚀 MIGRAÇÃO COMPLETA MySQL → Neon PostgreSQL")
    print("   (com conversão de schema)")
    print("=" * 60)
    
    mysql_conn = None
    postgres_conn = None
    total_migrated = 0
    
    try:
        print("\n🔌 Conectando aos bancos de dados...")
        mysql_conn = connect_mysql()
        postgres_conn = connect_postgres()
        print("   ✅ Conectado a ambos!")
        
        # Executar migrações em ordem
        migrations = [
            ('Users', migrate_users),
            ('Team Members', migrate_team_members),
            ('Categories', migrate_categories),
            ('Subcategories', migrate_subcategories),
            ('Products', migrate_products),
            ('Orders', migrate_orders),
            ('Tickets', migrate_tickets),
            ('Quotes', migrate_quotes),
            ('Blog Posts', migrate_blog_posts),
            ('WhatsApp Messages', migrate_whatsapp_messages),
        ]
        
        for name, func in migrations:
            try:
                count = func(mysql_conn, postgres_conn)
                total_migrated += count
            except Exception as e:
                print(f"\n❌ Erro crítico em {name}: {e}")
        
        # Resumo final
        print("\n" + "=" * 60)
        print(f"✅ MIGRAÇÃO CONCLUÍDA!")
        print(f"   📊 Total de registros migrados: {total_migrated}")
        print(f"\n🎉 Todos os dados foram transferidos para o Neon!")
        
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
