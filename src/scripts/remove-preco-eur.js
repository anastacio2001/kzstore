// Script to remove preco_eur from products.ts
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/products.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Remove all lines containing preco_eur
const lines = content.split('\n');
const filteredLines = lines.filter(line => !line.includes('preco_eur:'));
content = filteredLines.join('\n');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ preco_eur removed successfully!');
