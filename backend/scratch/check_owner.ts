import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkOwner() {
  const email = 'admin@alphapowerzone.com';
  const owner = await prisma.owner.findUnique({ where: { email } });
  
  if (!owner) {
    console.log(`❌ Owner ${email} NOT found.`);
    return;
  }
  
  console.log(`✅ Owner found: ${owner.name}`);
  const match = await bcrypt.compare('admin123', owner.password);
  console.log(`Test with 'admin123': ${match ? 'MATCH' : 'NO MATCH'}`);
}

checkOwner()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
