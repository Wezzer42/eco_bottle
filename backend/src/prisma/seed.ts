import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Use picsum.photos which guarantees 200 responses for seeded placeholders
  const imgFor = (i: number) => `https://picsum.photos/seed/eco${i}/600/600`;
  for (let i = 0; i < 4; i++) {
    await prisma.product.upsert({
      where: { id: i + 1 },
      update: {
        name: `EcoBottle ${i + 1}`,
        price: 1999 + i * 100,
        imageUrl: imgFor(i),
        stock: 100 - i
      },
      create: {
        name: `EcoBottle ${i + 1}`,
        price: 1999 + i * 100,
        imageUrl: imgFor(i),
        stock: 100 - i
      }
    });
  }
}

main().then(() => process.exit(0));

