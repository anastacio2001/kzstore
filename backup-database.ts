/**
 * Script de Backup Completo do Banco de Dados PostgreSQL
 * Exporta todos os dados em formato JSON
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, 'backups');
  
  // Criar diretório de backups se não existir
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  console.log('🔄 Iniciando backup do banco de dados...');
  console.log(`📁 Arquivo: ${backupFile}`);

  try {
    const backup: any = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL - Neon',
        version: '1.0'
      },
      data: {}
    };

    // Products
    console.log('📦 Backup: Products...');
    backup.data.products = await prisma.product.findMany();
    console.log(`   ✅ ${backup.data.products.length} produtos`);

    // Orders
    console.log('📦 Backup: Orders...');
    backup.data.orders = await prisma.order.findMany();
    console.log(`   ✅ ${backup.data.orders.length} pedidos`);

    // Reviews
    console.log('📦 Backup: Reviews...');
    backup.data.reviews = await prisma.review.findMany();
    console.log(`   ✅ ${backup.data.reviews.length} reviews`);

    // Coupons
    console.log('📦 Backup: Coupons...');
    backup.data.coupons = await prisma.coupon.findMany();
    console.log(`   ✅ ${backup.data.coupons.length} cupons`);

    // Users
    console.log('📦 Backup: Users...');
    backup.data.users = await prisma.user.findMany();
    console.log(`   ✅ ${backup.data.users.length} usuários`);

    // Team Members
    console.log('📦 Backup: Team Members...');
    backup.data.teamMembers = await prisma.teamMember.findMany();
    console.log(`   ✅ ${backup.data.teamMembers.length} membros da equipe`);

    // Categories
    console.log('📦 Backup: Categories...');
    backup.data.categories = await prisma.category.findMany();
    console.log(`   ✅ ${backup.data.categories.length} categorias`);

    // Subcategories
    console.log('📦 Backup: Subcategories...');
    backup.data.subcategories = await prisma.subcategory.findMany();
    console.log(`   ✅ ${backup.data.subcategories.length} subcategorias`);

    // Flash Sales
    console.log('📦 Backup: Flash Sales...');
    backup.data.flashSales = await prisma.flashSale.findMany();
    console.log(`   ✅ ${backup.data.flashSales.length} flash sales`);

    // Pre Orders
    console.log('📦 Backup: Pre Orders...');
    backup.data.preOrders = await prisma.preOrder.findMany();
    console.log(`   ✅ ${backup.data.preOrders.length} pré-vendas`);

    // Price Alerts
    console.log('📦 Backup: Price Alerts...');
    backup.data.priceAlerts = await prisma.priceAlert.findMany();
    console.log(`   ✅ ${backup.data.priceAlerts.length} alertas de preço`);

    // Stock History
    console.log('📦 Backup: Stock History...');
    backup.data.stockHistory = await prisma.stockHistory.findMany();
    console.log(`   ✅ ${backup.data.stockHistory.length} registros de estoque`);

    // Customer Profiles
    console.log('📦 Backup: Customer Profiles...');
    backup.data.customerProfiles = await prisma.customerProfile.findMany();
    console.log(`   ✅ ${backup.data.customerProfiles.length} perfis de clientes`);

    // Blog Posts
    console.log('📦 Backup: Blog Posts...');
    backup.data.blogPosts = await prisma.blogPost.findMany();
    console.log(`   ✅ ${backup.data.blogPosts.length} posts do blog`);

    // Newsletter Subscribers
    console.log('📦 Backup: Newsletter Subscribers...');
    backup.data.newsletterSubscribers = await prisma.newsletterSubscriber.findMany();
    console.log(`   ✅ ${backup.data.newsletterSubscribers.length} inscritos na newsletter`);

    // Abandoned Carts
    console.log('📦 Backup: Abandoned Carts...');
    backup.data.abandonedCarts = await prisma.abandonedCart.findMany();
    console.log(`   ✅ ${backup.data.abandonedCarts.length} carrinhos abandonados`);

    // Favorites
    console.log('📦 Backup: Favorites...');
    backup.data.favorites = await prisma.favorite.findMany();
    console.log(`   ✅ ${backup.data.favorites.length} favoritos`);

    // Quotes
    console.log('📦 Backup: Quotes...');
    backup.data.quotes = await prisma.quote.findMany();
    console.log(`   ✅ ${backup.data.quotes.length} cotações`);

    // Tickets
    console.log('📦 Backup: Tickets...');
    backup.data.tickets = await prisma.ticket.findMany();
    console.log(`   ✅ ${backup.data.tickets.length} tickets`);

    // Analytics Events
    console.log('📦 Backup: Analytics Events...');
    backup.data.analyticsEvents = await prisma.analyticsEvent.findMany();
    console.log(`   ✅ ${backup.data.analyticsEvents.length} eventos de analytics`);

    // Loyalty Accounts
    console.log('📦 Backup: Loyalty Accounts...');
    backup.data.loyaltyAccounts = await prisma.loyaltyAccount.findMany();
    console.log(`   ✅ ${backup.data.loyaltyAccounts.length} contas de fidelidade`);

    // Salvar backup em arquivo
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ BACKUP CONCLUÍDO COM SUCESSO!');
    console.log(`📁 Arquivo: ${backupFile}`);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`);
    console.log(`⏰ Data: ${new Date().toLocaleString('pt-BR')}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar backup
backupDatabase()
  .then((file) => {
    console.log(`\n✅ Backup salvo: ${file}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha no backup:', error);
    process.exit(1);
  });
