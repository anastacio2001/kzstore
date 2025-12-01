import { getPrismaClient } from '../src/utils/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = getPrismaClient();

async function fixTestMember() {
  const email = 'teste@kzstore.ao';
  const password = 'bXuceyZtApYa';
  
  try {
    const member = await prisma.teamMember.findUnique({
      where: { email }
    });
    
    if (!member) {
      console.log('❌ Membro não encontrado');
      process.exit(1);
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('✅ User já existe para este membro');
      process.exit(0);
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name: member.name,
        user_type: 'team',
        is_active: true,
        team_member_id: member.id
      }
    });
    
    console.log('✅ User criado para membro teste');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestMember();
