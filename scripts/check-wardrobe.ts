import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.clothItem.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      category: true,
      color: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  console.log('\n=== Son eklenen kıyafetler ===\n');
  items.forEach((item, index) => {
    console.log(`${index + 1}. ID: ${item.id}`);
    console.log(`   Kategori: ${item.category}`);
    console.log(`   Renk: ${item.color}`);
    console.log(`   Görsel: ${item.imageUrl}`);
    console.log(`   Tarih: ${item.createdAt.toISOString()}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
