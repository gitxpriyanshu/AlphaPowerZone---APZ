const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Check if owner exists
  const existingOwner = await prisma.owner.findFirst({
    where: { email: 'admin@apz.com' }
  });

  if (existingOwner) {
    console.log("Owner already exists:", existingOwner.email);
  } else {
    // Create an owner password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newOwner = await prisma.owner.create({
      data: {
        name: 'Super Admin',
        email: 'admin@apz.com',
        password: hashedPassword,
      }
    });
    console.log("Created newly seeded owner account:", newOwner.email);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
