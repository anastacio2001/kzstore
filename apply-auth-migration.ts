// Script para aplicar migração de autenticação no banco de produção
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyAuthMigration() {
  console.log('🔄 Verificando se a tabela users já existe...');
  
  try {
    // Tentar buscar um usuário para verificar se a tabela existe
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    console.log('✅ Tabela users já existe!');
    
    // Verificar se há usuários
    const userCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM users
    `;
    console.log(`📊 Total de usuários: ${userCount[0].count}`);
    
  } catch (error: any) {
    if (error.code === 'P2010' || error.message.includes("doesn't exist")) {
      console.log('❌ Tabela users não existe. Aplicando migração...');
      
      try {
        // Adicionar campos ao team_members
        console.log('1️⃣ Adicionando campos temp_password e password_changed ao team_members...');
        await prisma.$executeRaw`
          ALTER TABLE team_members 
          ADD COLUMN IF NOT EXISTS temp_password VARCHAR(191) NULL,
          ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT false
        `;
        
        // Criar tabela users
        console.log('2️⃣ Criando tabela users...');
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(191) NOT NULL,
            email VARCHAR(191) NOT NULL,
            password_hash VARCHAR(191) NOT NULL,
            name VARCHAR(191) NOT NULL,
            user_type VARCHAR(191) NOT NULL DEFAULT 'team',
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            last_login DATETIME(3) NULL,
            team_member_id VARCHAR(191) NULL,
            
            PRIMARY KEY (id),
            UNIQUE KEY users_email_key (email),
            UNIQUE KEY users_team_member_id_key (team_member_id),
            KEY users_email_idx (email),
            KEY users_user_type_idx (user_type),
            KEY users_is_active_idx (is_active)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `;
        
        // Adicionar foreign key
        console.log('3️⃣ Adicionando foreign key...');
        await prisma.$executeRaw`
          ALTER TABLE users 
          ADD CONSTRAINT IF NOT EXISTS users_team_member_id_fkey 
          FOREIGN KEY (team_member_id) REFERENCES team_members(id) 
          ON DELETE SET NULL ON UPDATE CASCADE
        `;
        
        console.log('✅ Migração aplicada com sucesso!');
        
        // Criar admin se não existir
        console.log('4️⃣ Verificando se existe admin...');
        const adminEmail = 'l.anastacio001@gmail.com';
        
        const existingAdmin = await prisma.$queryRaw<Array<any>>`
          SELECT * FROM users WHERE email = ${adminEmail} LIMIT 1
        `;
        
        if (existingAdmin.length === 0) {
          console.log('📝 Criando usuário admin...');
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash('Mae2019@@@', 10);
          
          await prisma.$executeRaw`
            INSERT INTO users (id, email, password_hash, name, user_type, is_active, created_at, updated_at)
            VALUES (
              UUID(),
              ${adminEmail},
              ${hashedPassword},
              'Administrador',
              'admin',
              true,
              NOW(),
              NOW()
            )
          `;
          
          console.log('✅ Admin criado com sucesso!');
        } else {
          console.log('✅ Admin já existe!');
        }
        
      } catch (migrationError) {
        console.error('❌ Erro ao aplicar migração:', migrationError);
        throw migrationError;
      }
    } else {
      throw error;
    }
  }
  
  await prisma.$disconnect();
  console.log('✅ Processo concluído!');
}

applyAuthMigration()
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
