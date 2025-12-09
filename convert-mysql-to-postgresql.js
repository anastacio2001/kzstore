#!/usr/bin/env node
/**
 * Script para converter dump MySQL para PostgreSQL
 * Converte tipos de dados, sintaxe e comandos incompatíveis
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando conversão MySQL → PostgreSQL...\n');

// Ler o arquivo SQL do MySQL
const mysqlFile = './mysql-backup.sql';
const postgresFile = './postgres-schema-and-data.sql';

if (!fs.existsSync(mysqlFile)) {
  console.error('❌ Arquivo mysql-backup.sql não encontrado!');
  process.exit(1);
}

let sql = fs.readFileSync(mysqlFile, 'utf8');

console.log('📝 Aplicando conversões...\n');

// 1. Remover comandos específicos do MySQL
sql = sql.replace(/\/\*!40\d{3}.*?\*\/;?/gs, ''); // Conditional comments
sql = sql.replace(/SET .+?;/g, ''); // SET commands
sql = sql.replace(/-- MySQL dump.*/g, '');
sql = sql.replace(/-- Host:.*/g, '');
sql = sql.replace(/-- Server version.*/g, '');
sql = sql.replace(/LOCK TABLES .+? WRITE;/gi, '');
sql = sql.replace(/UNLOCK TABLES;/gi, '');
sql = sql.replace(/\/\*!40000 ALTER TABLE .+? DISABLE KEYS \*\/;/gi, '');
sql = sql.replace(/\/\*!40000 ALTER TABLE .+? ENABLE KEYS \*\/;/gi, '');

// 2. Converter ENGINE e DEFAULT CHARSET
sql = sql.replace(/\) ENGINE=\w+ DEFAULT CHARSET=\w+( COLLATE=\w+)?;/gi, ');');
sql = sql.replace(/ENGINE=InnoDB/gi, '');
sql = sql.replace(/DEFAULT CHARSET=\w+/gi, '');
sql = sql.replace(/COLLATE=\w+/gi, '');
sql = sql.replace(/CHARACTER SET \w+/gi, '');

// 3. Converter AUTO_INCREMENT para SERIAL/BIGSERIAL
sql = sql.replace(/`?id`?\s+bigint\(\d+\)\s+NOT NULL AUTO_INCREMENT/gi, 'id BIGSERIAL PRIMARY KEY');
sql = sql.replace(/`?id`?\s+int\(\d+\)\s+NOT NULL AUTO_INCREMENT/gi, 'id SERIAL PRIMARY KEY');
sql = sql.replace(/`?id`?\s+bigint\s+NOT NULL AUTO_INCREMENT/gi, 'id BIGSERIAL PRIMARY KEY');
sql = sql.replace(/`?id`?\s+int\s+NOT NULL AUTO_INCREMENT/gi, 'id SERIAL PRIMARY KEY');

// Remover PRIMARY KEY duplicada após conversão
sql = sql.replace(/,\s*PRIMARY KEY \(`?id`?\)/gi, '');

// 4. Converter tipos de dados
sql = sql.replace(/datetime/gi, 'TIMESTAMP');
sql = sql.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
sql = sql.replace(/tinyint\(1\)/gi, 'BOOLEAN');
sql = sql.replace(/tinyint\(\d+\)/gi, 'SMALLINT');
sql = sql.replace(/int\(\d+\)/gi, 'INTEGER');
sql = sql.replace(/bigint\(\d+\)/gi, 'BIGINT');
sql = sql.replace(/double/gi, 'DOUBLE PRECISION');
sql = sql.replace(/mediumtext/gi, 'TEXT');
sql = sql.replace(/longtext/gi, 'TEXT');
sql = sql.replace(/text COLLATE \w+/gi, 'TEXT');

// 5. Remover backticks (`)
sql = sql.replace(/`/g, '"');

// 6. Converter ENUM para VARCHAR com CHECK constraint
const enumRegex = /"(\w+)"\s+enum\(([^)]+)\)/gi;
sql = sql.replace(enumRegex, (match, columnName, enumValues) => {
  const values = enumValues.replace(/'/g, "''");
  return `"${columnName}" VARCHAR(50) CHECK ("${columnName}" IN (${enumValues}))`;
});

// 7. Converter valores DEFAULT
sql = sql.replace(/DEFAULT b'0'/gi, "DEFAULT FALSE");
sql = sql.replace(/DEFAULT b'1'/gi, "DEFAULT TRUE");

// 8. Converter CREATE TABLE IF NOT EXISTS
sql = sql.replace(/CREATE TABLE IF NOT EXISTS/gi, 'CREATE TABLE IF NOT EXISTS');

// 9. Converter UNIQUE KEY
sql = sql.replace(/UNIQUE KEY `?\w+`? \((.+?)\)/gi, 'UNIQUE ($1)');
sql = sql.replace(/KEY `?\w+`? \((.+?)\)/gi, ''); // Remover índices simples, recriar depois

// 10. Converter INSERT com aspas
sql = sql.replace(/INSERT INTO `?(\w+)`?/gi, 'INSERT INTO "$1"');

// 11. Adicionar BEGIN/COMMIT para transações
sql = 'BEGIN;\n\n' + sql + '\n\nCOMMIT;';

// 12. Limpar linhas vazias múltiplas
sql = sql.replace(/\n{3,}/g, '\n\n');

// Salvar arquivo convertido
fs.writeFileSync(postgresFile, sql);

console.log('✅ Conversão concluída!\n');
console.log(`📄 Arquivo gerado: ${postgresFile}`);
console.log(`📊 Tamanho: ${(fs.statSync(postgresFile).size / 1024).toFixed(2)} KB\n`);

console.log('⚠️  IMPORTANTE:');
console.log('   1. Revise o arquivo antes de importar');
console.log('   2. Alguns ajustes manuais podem ser necessários');
console.log('   3. Teste primeiro em ambiente de dev\n');
