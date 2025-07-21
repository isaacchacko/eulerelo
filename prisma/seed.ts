import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUsers = [
    {
      name: 'cat',
      email: 'cat@tamu.edu',
      password: await bcrypt.hash('cat', 10),
      elo: 1500,
      problemsSolved: 5,
    },
    {
      name: 'dog',
      email: 'dog@tamu.edu',
      password: await bcrypt.hash('dog', 10),
      elo: 1400,
      problemsSolved: 3,
    },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
