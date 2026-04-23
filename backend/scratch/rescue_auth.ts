import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'priyanshukv1310@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`❌ User ${email} NOT found in database.`);
    return;
  }
  
  console.log(`✅ User found: ${user.name}`);
  console.log(`Hash starts with: ${user.password.substring(0, 7)}...`);
  
  // Test common password
  const testPass = '12345678';
  const match = await bcrypt.compare(testPass, user.password);
  console.log(`Test with '12345678': ${match ? 'MATCH' : 'NO MATCH'}`);
  
  // Reset if needed
  const newHash = await bcrypt.hash('12345678', 10);
  await prisma.user.update({
    where: { email },
    data: { password: newHash }
  });
  console.log(`🔄 Password reset to '12345678' for testing.`);
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
