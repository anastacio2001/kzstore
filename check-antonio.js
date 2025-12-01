import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'antoniioanastaciio@gmail.com' },
    include: { team_member: true }
  });
  
  if (!user) {
    console.log('⚠️  Usuário não encontrado!');
    return;
  }
  
  console.log('👤 Usuário:', {
    email: user.email,
    name: user.name,
    user_type: user.user_type,
    is_active: user.is_active,
    team_member_id: user.team_member_id
  });
  
  if (user.team_member) {
    console.log('👥 TeamMember associado:', {
      email: user.team_member.email,
      name: user.team_member.name,
      role: user.team_member.role,
      is_active: user.team_member.is_active
    });
  } else {
    console.log('⚠️  Nenhum TeamMember associado - precisa criar!');
  }
  
  await prisma.$disconnect();
}

checkUser();
