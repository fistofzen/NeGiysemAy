const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const outfit = await prisma.outfit.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          clothItem: {
            select: {
              category: true,
              color: true,
            }
          }
        }
      }
    }
  });

  if (!outfit) {
    console.log('Kombin bulunamadı');
    return;
  }

  console.log('\n=== Son Kombin ===\n');
  outfit.items.forEach((item, i) => {
    console.log(`${i + 1}. Role: ${item.role} | Gerçek Kategori: ${item.clothItem?.category} | Renk: ${item.clothItem?.color}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
