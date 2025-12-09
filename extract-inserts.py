#!/usr/bin/env python3
"""
Extrai INSERTs do backup MySQL e converte para PostgreSQL
"""

import re
import sys

print("🔄 Extraindo e convertendo INSERTs para PostgreSQL...\n")

with open('mysql-backup.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair apenas INSERTs
inserts = re.findall(r'INSERT INTO `?(\w+)`? VALUES (.+?);', content, re.DOTALL)

output_lines = ["BEGIN;\n"]
output_lines.append("-- Desabilitar triggers temporariamente\n")
output_lines.append("SET session_replication_role = replica;\n\n")

for table_name, values in inserts:
    print(f"Processando {table_name}...")
    
    # Converter nome da tabela
    pg_table = f'"{table_name}"'
    
    # Converter valores
    # Remover backticks
    values = values.replace('`', '"')
    
    # Converter booleanos
    values = re.sub(r"\bb'0'\b", 'FALSE', values)
    values = re.sub(r"\bb'1'\b", 'TRUE', values)
    
    # Adicionar INSERT
    output_lines.append(f"INSERT INTO {pg_table} VALUES {values};\n")

output_lines.append("\n-- Reabilitar triggers\n")
output_lines.append("SET session_replication_role = DEFAULT;\n")
output_lines.append("\nCOMMIT;\n")

# Salvar
with open('neon-data-import.sql', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print(f"\n✅ Arquivo gerado: neon-data-import.sql")
print(f"📊 {len(inserts)} tabelas processadas")
