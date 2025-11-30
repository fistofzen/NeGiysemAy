const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Tüm outfitleri sil
  await prisma.outfitItem.deleteMany({});
  await prisma.outfit.deleteMany({});
  
  console.log('Tüm kombinler silindi. Artık dashboard\'dan yeni kombin oluşturabilirsin.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
