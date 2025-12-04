#!/bin/bash
# Verificar estrutura da tabela advertisements

gcloud sql connect kzstore-01 --user=kzstore_app --project=kzstore-477422 <<'SQL'
USE kzstore_prod;

-- Verificar se coluna existe
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'advertisements' 
AND COLUMN_NAME LIKE 'imagem%'
ORDER BY COLUMN_NAME;

-- Ver estrutura completa
DESCRIBE advertisements;
SQL
