#!/usr/bin/env python3
"""
Migração COMPLETA MySQL → Neon PostgreSQL
Resolve todos os problemas de schema e converte dados
"""

import mysql.connector
import psycopg2
from datetime import datetime
import json
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

def connect_mysql():
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_postgres():
    return psycopg2.connect(**POSTGRES_CONFIG)

def safe_convert(value):
    """Converte valores MySQL para PostgreSQL com segurança"""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, (bytes, bytearray)):
        try:
            return value.decode('utf-8')
        except:
            return None
    if isinstance(value, int) and value in (0, 1):
        return bool(value)
    return value

def migrate_users(mysql_conn, postgres_conn):
    """Migra tabela users com conversão de campos"""
    print("\n📦 Migrando USERS...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM users")
        rows = mysql_cur.fetchall()
        
        if not rows:
            print("   ⏭️  Vazia, pulando...")
            return True
        
        print(f"   📊 {len(rows)} usuários encontrados")
        
        migrated = 0
        for row in rows:
            try:
                # Mapear campos MySQL → PostgreSQL
                postgres_cur.execute("""
                    INSERT INTO users (
                        id, email, password_hash, name, user_type,
                        is_active, created_at, updated_at, last_login
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row['email'],
                    row.get('password_hash'),
                    row.get('name'),
                    row.get('user_type', 'customer'),
                    bool(row.get('is_active', 1)),
                    row.get('created_at'),
                    row.get('updated_at'),
                    row.get('last_login')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro linha {row.get('id')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} usuários migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_categories(mysql_conn, postgres_conn):
    """Migra categorias"""
    print("\n📦 Migrando CATEGORIES...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM categories")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} categorias encontradas")
        
        migrated = 0
        for row in rows:
            try:
                postgres_cur.execute("""
                    INSERT INTO categories (
                        id, name, slug, description, icon, image_url,
                        parent_id, "order", active, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row['name'],
                    row.get('slug'),
                    row.get('description'),
                    row.get('icon'),
                    row.get('image_url'),
                    row.get('parent_id'),
                    row.get('order', 0),
                    bool(row.get('active', 1)),
                    row.get('created_at'),
                    row.get('updated_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro linha {row.get('id')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} categorias migradas!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_subcategories(mysql_conn, postgres_conn):
    """Migra subcategorias"""
    print("\n📦 Migrando SUBCATEGORIES...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM subcategories")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} subcategorias encontradas")
        
        migrated = 0
        for row in rows:
            try:
                postgres_cur.execute("""
                    INSERT INTO subcategories (
                        id, name, slug, category_id, description,
                        created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row['name'],
                    row.get('slug'),
                    row.get('category_id'),
                    row.get('description'),
                    row.get('created_at'),
                    row.get('updated_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro linha {row.get('id')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} subcategorias migradas!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_products(mysql_conn, postgres_conn):
    """Migra produtos - A MAIS CRÍTICA"""
    print("\n📦 Migrando PRODUCTS...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM products WHERE ativo = 1")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} produtos ativos encontrados")
        
        migrated = 0
        for row in rows:
            try:
                # Processar imagens (pode ser JSON ou string)
                imagens = row.get('imagens')
                if imagens and isinstance(imagens, str):
                    try:
                        imagens = json.loads(imagens)
                    except:
                        imagens = [imagens]
                
                # Processar especificações
                specs = row.get('especificacoes')
                if specs and isinstance(specs, str):
                    try:
                        specs = json.loads(specs)
                    except:
                        specs = {}
                
                # Processar tags
                tags = row.get('tags')
                if tags and isinstance(tags, str):
                    try:
                        tags = json.loads(tags)
                    except:
                        tags = [tags]
                
                postgres_cur.execute("""
                    INSERT INTO products (
                        id, nome, descricao, categoria, subcategoria,
                        condicao, preco_aoa, preco_usd, custo_aoa,
                        margem_lucro, estoque, estoque_minimo,
                        imagem_url, imagens, especificacoes,
                        marca, modelo, sku, codigo_barras,
                        peso_kg, dimensoes, ativo, destaque,
                        is_featured, featured_order, is_pre_order,
                        pre_order_info, fornecedor, tags,
                        category_id, subcategory_id,
                        created_at, updated_at,
                        rating_medio, total_avaliacoes, total_vendas,
                        shipping_type, shipping_cost_aoa, shipping_cost_usd
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('nome'),
                    row.get('descricao'),
                    row.get('categoria'),
                    row.get('subcategoria'),
                    row.get('condicao', 'new'),
                    row.get('preco_aoa'),
                    row.get('preco_usd'),
                    row.get('custo_aoa'),
                    row.get('margem_lucro'),
                    row.get('estoque', 0),
                    row.get('estoque_minimo', 5),
                    row.get('imagem_url'),
                    json.dumps(imagens) if imagens else None,
                    json.dumps(specs) if specs else None,
                    row.get('marca'),
                    row.get('modelo'),
                    row.get('sku'),
                    row.get('codigo_barras'),
                    row.get('peso_kg'),
                    row.get('dimensoes'),
                    bool(row.get('ativo', 1)),
                    bool(row.get('destaque', 0)),
                    bool(row.get('is_featured', 0)),
                    row.get('featured_order', 999),
                    bool(row.get('is_pre_order', 0)),
                    row.get('pre_order_info'),
                    row.get('fornecedor'),
                    json.dumps(tags) if tags else None,
                    row.get('category_id'),
                    row.get('subcategory_id'),
                    row.get('created_at'),
                    row.get('updated_at'),
                    row.get('rating_medio', 0.0),
                    row.get('total_avaliacoes', 0),
                    row.get('total_vendas', 0),
                    row.get('shipping_type', 'paid'),
                    row.get('shipping_cost_aoa', 0),
                    row.get('shipping_cost_usd', 0)
                ))
                postgres_conn.commit()
                migrated += 1
                
                if migrated % 10 == 0:
                    print(f"   📦 {migrated} produtos migrados...")
                    
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro produto {row.get('id')} ({row.get('nome', 'sem nome')[:30]}): {str(e)[:100]}")
        
        print(f"   ✅ {migrated}/{len(rows)} produtos migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_orders(mysql_conn, postgres_conn):
    """Migra pedidos"""
    print("\n📦 Migrando ORDERS...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM orders")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} pedidos encontrados")
        
        migrated = 0
        for row in rows:
            try:
                # Processar items (JSON)
                items = row.get('items')
                if items and isinstance(items, str):
                    try:
                        items = json.loads(items)
                    except:
                        items = []
                
                # Processar endereço
                shipping_address = row.get('shipping_address')
                if shipping_address and isinstance(shipping_address, str):
                    try:
                        shipping_address = json.loads(shipping_address)
                    except:
                        shipping_address = {}
                
                postgres_cur.execute("""
                    INSERT INTO orders (
                        id, order_number, user_id, user_name, user_email,
                        items, subtotal, tax_amount, discount_amount,
                        discount_type, shipping_cost, total,
                        payment_method, payment_status, shipping_address,
                        status, tracking_number, notes,
                        created_at, updated_at, delivered_at, cancelled_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('order_number'),
                    row.get('user_id'),
                    row.get('user_name'),
                    row.get('user_email'),
                    json.dumps(items) if items else None,
                    row.get('subtotal', 0),
                    row.get('tax_amount', 0),
                    row.get('discount_amount', 0),
                    row.get('discount_type'),
                    row.get('shipping_cost', 0),
                    row.get('total', 0),
                    row.get('payment_method'),
                    row.get('payment_status', 'pending'),
                    json.dumps(shipping_address) if shipping_address else None,
                    row.get('status', 'pending'),
                    row.get('tracking_number'),
                    row.get('notes'),
                    row.get('created_at'),
                    row.get('updated_at'),
                    row.get('delivered_at'),
                    row.get('cancelled_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro pedido {row.get('order_number')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} pedidos migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_blog_posts(mysql_conn, postgres_conn):
    """Migra posts do blog"""
    print("\n📦 Migrando BLOG POSTS...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM blog_posts")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} posts encontrados")
        
        migrated = 0
        for row in rows:
            try:
                # Processar arrays
                tags = row.get('tags')
                if tags and isinstance(tags, str):
                    try:
                        tags = json.loads(tags)
                    except:
                        tags = [tags]
                
                images = row.get('images')
                if images and isinstance(images, str):
                    try:
                        images = json.loads(images)
                    except:
                        images = []
                
                postgres_cur.execute("""
                    INSERT INTO blog_posts (
                        id, title, slug, excerpt, content,
                        cover_image, images, category, tags,
                        author_id, author_name, author_email,
                        meta_title, meta_description, meta_keywords,
                        status, is_featured, published_at,
                        views_count, likes_count,
                        created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    row.get('title'),
                    row.get('slug'),
                    row.get('excerpt'),
                    row.get('content'),
                    row.get('cover_image'),
                    json.dumps(images) if images else None,
                    row.get('category'),
                    json.dumps(tags) if tags else None,
                    row.get('author_id'),
                    row.get('author_name'),
                    row.get('author_email'),
                    row.get('meta_title'),
                    row.get('meta_description'),
                    row.get('meta_keywords'),
                    row.get('status', 'draft'),
                    bool(row.get('is_featured', 0)),
                    row.get('published_at'),
                    row.get('views_count', 0),
                    row.get('likes_count', 0),
                    row.get('created_at'),
                    row.get('updated_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro post {row.get('id')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} posts migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def migrate_tickets(mysql_conn, postgres_conn):
    """Migra tickets de suporte"""
    print("\n📦 Migrando TICKETS...")
    
    mysql_cur = mysql_conn.cursor(dictionary=True)
    postgres_cur = postgres_conn.cursor()
    
    try:
        mysql_cur.execute("SELECT * FROM tickets")
        rows = mysql_cur.fetchall()
        
        print(f"   📊 {len(rows)} tickets encontrados")
        
        migrated = 0
        for row in rows:
            try:
                # Preparar admin_response como messages
                messages = []
                if row.get('admin_response'):
                    messages.append({
                        'text': row.get('admin_response'),
                        'from': 'admin',
                        'timestamp': row.get('updated_at').isoformat() if row.get('updated_at') else None
                    })
                
                postgres_cur.execute("""
                    INSERT INTO tickets (
                        id, ticket_number, user_id, user_name, user_email,
                        subject, category, priority, status, description,
                        messages, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    row['id'],
                    f"TKT-{row['id'][:8]}",
                    row.get('user_id'),
                    row.get('user_id', 'Cliente'),
                    'cliente@kzstore.ao',
                    row.get('subject'),
                    row.get('category', 'general'),
                    row.get('priority', 'normal'),
                    row.get('status', 'open'),
                    row.get('description'),
                    json.dumps(messages),
                    row.get('created_at'),
                    row.get('updated_at')
                ))
                postgres_conn.commit()
                migrated += 1
            except Exception as e:
                postgres_conn.rollback()
                print(f"   ⚠️  Erro ticket {row.get('id')}: {str(e)[:80]}")
        
        print(f"   ✅ {migrated}/{len(rows)} tickets migrados!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        postgres_conn.rollback()
        return False
    finally:
        mysql_cur.close()
        postgres_cur.close()

def main():
    print("🚀 MIGRAÇÃO COMPLETA MySQL → Neon PostgreSQL\n")
    print("=" * 60)
    
    mysql_conn = None
    postgres_conn = None
    
    try:
        print("\n🔌 Conectando ao MySQL...")
        mysql_conn = connect_mysql()
        print("   ✅ MySQL conectado!")
        
        print("\n🔌 Conectando ao Neon PostgreSQL...")
        postgres_conn = connect_postgres()
        print("   ✅ Neon conectado!")
        
        # Migração em ordem (respeitando foreign keys)
        results = {}
        
        results['users'] = migrate_users(mysql_conn, postgres_conn)
        results['categories'] = migrate_categories(mysql_conn, postgres_conn)
        results['subcategories'] = migrate_subcategories(mysql_conn, postgres_conn)
        results['products'] = migrate_products(mysql_conn, postgres_conn)
        results['orders'] = migrate_orders(mysql_conn, postgres_conn)
        results['blog_posts'] = migrate_blog_posts(mysql_conn, postgres_conn)
        results['tickets'] = migrate_tickets(mysql_conn, postgres_conn)
        
        # Resumo final
        print("\n" + "=" * 60)
        print("\n✅ MIGRAÇÃO CONCLUÍDA!\n")
        
        success = sum(1 for v in results.values() if v)
        total = len(results)
        
        print(f"📊 Resultado: {success}/{total} tabelas migradas com sucesso\n")
        
        for table, status in results.items():
            emoji = "✅" if status else "❌"
            print(f"   {emoji} {table}")
        
        print("\n" + "=" * 60)
        
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
