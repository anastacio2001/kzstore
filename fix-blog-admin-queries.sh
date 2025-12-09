#!/bin/bash
# Script para corrigir padrões de query no blog-admin.ts

FILE="backend/admin/blog-admin.ts"

# Backup
cp "$FILE" "$FILE.backup"

# Padrão 1: const stats = await prisma -> const result = await / const stats = result[0];
sed -i '' 's/const stats = await prisma\.\$queryRawUnsafe(/const result = await prisma.$queryRawUnsafe(/g' "$FILE"

echo "Correções aplicadas ao $FILE"
echo "Backup salvo em $FILE.backup"
