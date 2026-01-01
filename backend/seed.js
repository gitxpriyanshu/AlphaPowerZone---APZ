const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const category = await prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Default Category',
            Image: 'http://example.com/default_category.png',
        },
    });
    console.log({ category });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
