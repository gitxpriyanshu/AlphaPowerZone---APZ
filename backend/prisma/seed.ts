import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Owner
  const hashedOwnerPassword = await bcrypt.hash('admin123', 10);
  const owner = await prisma.owner.upsert({
    where: { email: 'admin@alphapowerzone.com' },
    update: {},
    create: {
      name: 'Alpha Owner',
      email: 'admin@alphapowerzone.com',
      password: hashedOwnerPassword,
    },
  });
  console.log('✅ Owner created:', owner.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Gym Equipment' },
      update: {},
      create: { name: 'Gym Equipment', slug: 'gym-equipment', description: 'Heavy duty gym gear' },
    }),
    prisma.category.upsert({
      where: { name: 'Supplements' },
      update: {},
      create: { name: 'Supplements', slug: 'supplements', description: 'Elite nutrition' },
    }),
    prisma.category.upsert({
      where: { name: 'Apparel' },
      update: {},
      create: { name: 'Apparel', slug: 'apparel', description: 'High performance wear' },
    }),
  ]);
  console.log('✅ Categories created');

  // Create Products
  const productData = [
    {
      name: 'Alpha Adjustable Dumbbells',
      slug: 'alpha-adjustable-dumbbells',
      description: 'Set of two 24kg adjustable dumbbells for versatile workouts.',
      price: 299.99,
      categoryId: categories[0].id,
      stock: 50,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000'],
    },
    {
      name: 'Power Rack Elite',
      slug: 'power-rack-elite',
      description: 'Heavy duty steel power rack for home or commercial gyms.',
      price: 899.00,
      categoryId: categories[0].id,
      stock: 10,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000'],
    },
    {
      name: 'Whey Isolate Protein (2kg)',
      slug: 'whey-isolate-protein',
      description: 'Premium grass-fed whey isolate with 25g protein per serving.',
      price: 64.99,
      categoryId: categories[1].id,
      stock: 100,
      images: ['https://images.unsplash.com/photo-1593095191070-9a701008538c?q=80&w=1000'],
    },
    {
      name: 'Performance Compression Tee',
      slug: 'compression-tee',
      description: 'Moisture-wicking compression shirt for maximum performance.',
      price: 34.99,
      categoryId: categories[2].id,
      stock: 200,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000'],
    },
    // Add more products as needed to reach 10
  ];

  for (const product of productData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
