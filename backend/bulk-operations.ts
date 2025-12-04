import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Importa produtos de um arquivo CSV ou Excel
 */
export async function importProductsFromFile(
  filePath: string,
  fileType: 'csv' | 'xlsx'
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    console.log(`📥 [BULK] Iniciando importação de ${fileType.toUpperCase()}...`);

    let data: any[] = [];

    // Ler arquivo
    if (fileType === 'csv') {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true
      });
      data = parsed.data;
    } else if (fileType === 'xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet);
    }

    console.log(`📊 [BULK] ${data.length} produtos encontrados no arquivo`);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Processar cada linha
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Validar campos obrigatórios
        if (!row.nome || !row.preco_aoa) {
          throw new Error(`Linha ${i + 1}: nome e preco_aoa são obrigatórios`);
        }

        // Preparar dados do produto
        const productData: any = {
          nome: row.nome,
          descricao: row.descricao || null,
          categoria: row.categoria || 'Geral',
          subcategoria: row.subcategoria || null,
          condicao: row.condicao || 'Novo',
          preco_aoa: parseFloat(row.preco_aoa),
          preco_usd: row.preco_usd ? parseFloat(row.preco_usd) : null,
          estoque: parseInt(row.estoque) || 0,
          estoque_minimo: parseInt(row.estoque_minimo) || 5,
          sku: row.sku || null,
          codigo_barras: row.codigo_barras || null,
          marca: row.marca || null,
          modelo: row.modelo || null,
          peso_kg: row.peso_kg ? parseFloat(row.peso_kg) : null,
          ativo: row.ativo === 'false' || row.ativo === '0' ? false : true,
          destaque: row.destaque === 'true' || row.destaque === '1' ? true : false
        };

        // Verificar se produto já existe (por SKU ou nome)
        let existingProduct = null;
        if (productData.sku) {
          existingProduct = await prisma.product.findUnique({
            where: { sku: productData.sku }
          });
        }

        if (!existingProduct && productData.nome) {
          existingProduct = await prisma.product.findFirst({
            where: { nome: productData.nome }
          });
        }

        if (existingProduct) {
          // Atualizar produto existente
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          });
          console.log(`✏️  [BULK] Produto atualizado: ${productData.nome}`);
        } else {
          // Criar novo produto
          await prisma.product.create({
            data: productData
          });
          console.log(`✅ [BULK] Produto criado: ${productData.nome}`);
        }

        success++;
      } catch (error: any) {
        failed++;
        const errorMsg = `Linha ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ [BULK] ${errorMsg}`);
      }
    }

    console.log(`📊 [BULK] Importação concluída: ${success} sucesso, ${failed} falhas`);

    return { success, failed, errors };
  } catch (error) {
    console.error('❌ [BULK] Erro na importação:', error);
    throw error;
  }
}

/**
 * Exporta produtos para CSV
 */
export async function exportProductsToCSV(filters?: any): Promise<string> {
  try {
    console.log('📤 [BULK] Exportando produtos para CSV...');

    const products = await prisma.product.findMany({
      where: filters || {},
      orderBy: { created_at: 'desc' }
    });

    // Converter para formato CSV amigável
    const csvData = products.map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao || '',
      categoria: p.categoria,
      subcategoria: p.subcategoria || '',
      condicao: p.condicao || 'Novo',
      preco_aoa: Number(p.preco_aoa),
      preco_usd: p.preco_usd ? Number(p.preco_usd) : '',
      estoque: p.estoque,
      estoque_minimo: p.estoque_minimo,
      sku: p.sku || '',
      codigo_barras: p.codigo_barras || '',
      marca: p.marca || '',
      modelo: p.modelo || '',
      peso_kg: p.peso_kg ? Number(p.peso_kg) : '',
      ativo: p.ativo ? 'true' : 'false',
      destaque: p.destaque ? 'true' : 'false',
      created_at: p.created_at.toISOString()
    }));

    const csv = Papa.unparse(csvData);

    // Salvar arquivo
    const fileName = `products_export_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'exports', fileName);

    // Criar diretório se não existir
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'));
    }

    fs.writeFileSync(filePath, csv, 'utf8');

    console.log(`✅ [BULK] ${products.length} produtos exportados para: ${fileName}`);

    return filePath;
  } catch (error) {
    console.error('❌ [BULK] Erro na exportação CSV:', error);
    throw error;
  }
}

/**
 * Exporta produtos para Excel
 */
export async function exportProductsToExcel(filters?: any): Promise<string> {
  try {
    console.log('📤 [BULK] Exportando produtos para Excel...');

    const products = await prisma.product.findMany({
      where: filters || {},
      orderBy: { created_at: 'desc' }
    });

    // Converter para formato Excel
    const excelData = products.map(p => ({
      ID: p.id,
      Nome: p.nome,
      Descrição: p.descricao || '',
      Categoria: p.categoria,
      Subcategoria: p.subcategoria || '',
      Condição: p.condicao || 'Novo',
      'Preço (AOA)': Number(p.preco_aoa),
      'Preço (USD)': p.preco_usd ? Number(p.preco_usd) : '',
      Estoque: p.estoque,
      'Estoque Mínimo': p.estoque_minimo,
      SKU: p.sku || '',
      'Código de Barras': p.codigo_barras || '',
      Marca: p.marca || '',
      Modelo: p.modelo || '',
      'Peso (kg)': p.peso_kg ? Number(p.peso_kg) : '',
      Ativo: p.ativo ? 'Sim' : 'Não',
      Destaque: p.destaque ? 'Sim' : 'Não',
      'Criado em': p.created_at.toISOString().split('T')[0]
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    // Salvar arquivo
    const fileName = `products_export_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'exports', fileName);

    // Criar diretório se não existir
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'));
    }

    XLSX.writeFile(workbook, filePath);

    console.log(`✅ [BULK] ${products.length} produtos exportados para: ${fileName}`);

    return filePath;
  } catch (error) {
    console.error('❌ [BULK] Erro na exportação Excel:', error);
    throw error;
  }
}

/**
 * Exporta produtos para PDF
 */
export async function exportProductsToPDF(filters?: any): Promise<string> {
  try {
    console.log('📤 [BULK] Exportando produtos para PDF...');

    const products = await prisma.product.findMany({
      where: filters || {},
      orderBy: { created_at: 'desc' },
      take: 100 // Limitar a 100 para PDF
    });

    const fileName = `products_export_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'exports', fileName);

    // Criar diretório se não existir
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'));
    }

    // Criar PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Cabeçalho
    doc.fontSize(20).text('KZSTORE - Catálogo de Produtos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-AO')}`, { align: 'center' });
    doc.fontSize(10).text(`Total de produtos: ${products.length}`, { align: 'center' });
    doc.moveDown(2);

    // Listar produtos
    doc.fontSize(12);
    products.forEach((product, index) => {
      // Adicionar nova página a cada 10 produtos
      if (index > 0 && index % 10 === 0) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold').text(`${index + 1}. ${product.nome}`);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Categoria: ${product.categoria} ${product.subcategoria ? '> ' + product.subcategoria : ''}`);
      doc.text(`Preço: ${Number(product.preco_aoa).toLocaleString('pt-AO')} AOA`);
      doc.text(`Estoque: ${product.estoque} unidades`);
      if (product.sku) doc.text(`SKU: ${product.sku}`);
      if (product.marca) doc.text(`Marca: ${product.marca}`);

      doc.moveDown(0.5);
      doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    });

    // Rodapé
    doc.fontSize(8).text(
      'KZSTORE - Tech & Electronics | www.kzstore.ao',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

    // Aguardar finalização
    await new Promise((resolve) => stream.on('finish', resolve));

    console.log(`✅ [BULK] ${products.length} produtos exportados para PDF: ${fileName}`);

    return filePath;
  } catch (error) {
    console.error('❌ [BULK] Erro na exportação PDF:', error);
    throw error;
  }
}

/**
 * Atualização em massa de produtos
 */
export async function bulkUpdateProducts(
  productIds: string[],
  updates: any
): Promise<{ updated: number }> {
  try {
    console.log(`📝 [BULK] Atualizando ${productIds.length} produtos...`);

    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: updates
    });

    console.log(`✅ [BULK] ${result.count} produtos atualizados`);

    return { updated: result.count };
  } catch (error) {
    console.error('❌ [BULK] Erro na atualização em massa:', error);
    throw error;
  }
}
