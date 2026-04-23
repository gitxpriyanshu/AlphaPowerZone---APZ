import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listOwners() {
  const owners = await prisma.owner.findMany();
  console.log('--- OWNERS ---');
  owners.forEach(o => console.log(`- ${o.name} (${o.email})`));
  
  const users = await prisma.user.findMany({ take: 5 });
  console.log('\n--- USERS (sample) ---');
  users.forEach(u => console.log(`- ${u.name} (${u.email})`));
}

listOwners()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
