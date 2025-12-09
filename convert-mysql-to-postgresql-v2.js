#!/usr/bin/env node
/**
 * Conversor MySQL → PostgreSQL (Versão 2 - Mais Robusto)
 */

const fs = require('fs');

console.log('🔄 Conversão MySQL → PostgreSQL (v2)...\n');

let sql = fs.readFileSync('./mysql-backup.sql', 'utf8');

// 1. Remover todos os comentários MySQL
sql = sql.replace(/\/\*!.*?\*\/;?/gs, '');
sql = sql.replace(/-- .*/g, '');
sql = sql.replace(/^#.*/gm, '');

// 2. Remover comandos SET
sql = sql.replace(/^SET .*;$/gm, '');

// 3. Remover LOCK/UNLOCK TABLES
sql = sql.replace(/LOCK TABLES .+?;/gi, '');
sql = sql.replace(/UNLOCK TABLES;/gi, '');

// 4. Remover DROP TABLE (vamos criar limpo)
sql = sql.replace(/DROP TABLE IF EXISTS .+?;/gi, '');

// 5. Converter CREATE TABLE
sql = sql.replace(/CREATE TABLE (.+?) \(/gi, 'CREATE TABLE IF NOT EXISTS $1 (');

// 6. Remover backticks
sql = sql.replace(/`/g, '"');

// 7. Remover COLLATE
sql = sql.replace(/COLLATE \w+/gi, '');

// 8. Remover CHARACTER SET
sql = sql.replace(/CHARACTER SET \w+/gi, '');

// 9. Converter tipos
sql = sql.replace(/varchar\((\d+)\)/gi, 'VARCHAR($1)');
sql = sql.replace(/\bint\b/gi, 'INTEGER');
sql = sql.replace(/\bbigint\b/gi, 'BIGINT');
sql = sql.replace(/\btinyint\(1\)\b/gi, 'BOOLEAN');
sql = sql.replace(/\btinyint\b/gi, 'SMALLINT');
sql = sql.replace(/\bdatetime\b/gi, 'TIMESTAMP');
sql = sql.replace(/\bdouble\b/gi, 'DOUBLE PRECISION');
sql = sql.replace(/\btext\b/gi, 'TEXT');
sql = sql.replace(/\bmediumtext\b/gi, 'TEXT');
sql = sql.replace(/\blongtext\b/gi, 'TEXT');
sql = sql.replace(/\bjson\b/gi, 'JSONB');

// 10. Converter TIMESTAMP(3)
sql = sql.replace(/TIMESTAMP\(3\)/gi, 'TIMESTAMP');

// 11. Remover ENGINE, DEFAULT CHARSET, etc
sql = sql.replace(/\)\s*ENGINE=\w+.*;/gi, ');');
sql = sql.replace(/DEFAULT CHARSET=\w+/gi, '');
sql = sql.replace(/AUTO_INCREMENT=\d+/gi, '');

// 12. Remover índices KEY (recriar depois se necessário)
sql = sql.replace(/,?\s*KEY "[^"]+"\s*\([^)]+\)/gi, '');
sql = sql.replace(/,?\s*UNIQUE KEY "[^"]+"\s*\(([^)]+)\)/gi, ', UNIQUE ($1)');

// 13. Converter DEFAULT values
sql = sql.replace(/DEFAULT b'0'/gi, 'DEFAULT FALSE');
sql = sql.replace(/DEFAULT b'1'/gi, 'DEFAULT TRUE');
sql = sql.replace(/DEFAULT '0'/gi, 'DEFAULT FALSE');
sql = sql.replace(/DEFAULT '1'/gi, 'DEFAULT TRUE');

// 14. Converter CURRENT_TIMESTAMP(3) para CURRENT_TIMESTAMP
sql = sql.replace(/CURRENT_TIMESTAMP\(\d+\)/gi, 'CURRENT_TIMESTAMP');

// 15. Remover ON UPDATE CURRENT_TIMESTAMP
sql = sql.replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '');

// 16. Converter CONSTRAINT (foreign keys) - simplificar
sql = sql.replace(/CONSTRAINT "[^"]+"\s+FOREIGN KEY/gi, 'FOREIGN KEY');

// 17. Limpar vírgulas extras antes de )
sql = sql.replace(/,(\s*)\)/g, '$1)');

// 18. Adicionar transação
sql = 'BEGIN;\n\n-- Disable triggers temporariamente\nSET session_replication_role = replica;\n\n' + sql + '\n\n-- Re-enable triggers\nSET session_replication_role = DEFAULT;\n\nCOMMIT;';

// 19. Limpar linhas vazias múltiplas
sql = sql.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync('./postgres-import.sql', sql);

console.log('✅ Arquivo convertido: postgres-import.sql');
console.log(`📊 Tamanho: ${(fs.statSync('./postgres-import.sql').size / 1024).toFixed(2)} KB\n`);
