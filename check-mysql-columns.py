#!/usr/bin/env python3
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

tables = ['users', 'products', 'orders', 'categories', 'blog_posts']

for table in tables:
    cursor.execute(f"DESCRIBE `{table}`")
    columns = [row[0] for row in cursor.fetchall()]
    print(f"\n{table}: {', '.join(columns)}")

cursor.close()
conn.close()
