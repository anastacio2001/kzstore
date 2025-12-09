#!/usr/bin/env python3
"""
Verifica quais tabelas do MySQL têm dados não migrados
"""

import mysql.connector

MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3307,
    'user': 'kzstore_app',
    'password': 'Kzstore2024!',
    'database': 'kzstore_prod'
}

conn = mysql.connector.connect(**MYSQL_CONFIG)
cursor = conn.cursor()

# Listar todas as tabelas
cursor.execute("SHOW TABLES")
tables = [row[0] for row in cursor.fetchall()]

print("📊 ANÁLISE COMPLETA DO MYSQL\n")
print("=" * 80)

tabelas_com_dados = []

for table in sorted(tables):
    try:
        cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cursor.fetchone()[0]
        
        if count > 0:
            # Mostrar primeiras colunas para entender a estrutura
            cursor.execute(f"DESCRIBE `{table}`")
            columns = [row[0] for row in cursor.fetchall()]
            
            print(f"\n📦 {table}")
            print(f"   Total: {count} registros")
            print(f"   Colunas: {', '.join(columns[:8])}")
            
            # Mostrar sample de dados
            if count <= 10:
                cursor.execute(f"SELECT * FROM `{table}` LIMIT 1")
                sample = cursor.fetchone()
                if sample:
                    print(f"   Sample: {str(sample)[:100]}")
            
            tabelas_com_dados.append((table, count))
    except Exception as e:
        print(f"\n⚠️  {table}: Erro - {str(e)[:50]}")

print("\n" + "=" * 80)
print(f"\n📊 RESUMO: {len(tabelas_com_dados)} tabelas com dados")
print("\nTabelas por quantidade de registros:")
for table, count in sorted(tabelas_com_dados, key=lambda x: x[1], reverse=True):
    print(f"   {table}: {count}")

cursor.close()
conn.close()
