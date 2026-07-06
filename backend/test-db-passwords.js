const { PrismaClient } = require('@prisma/client');

const passwords = [
  'postgres',
  'root',
  'admin',
  'password',
  '123456',
  '1234',
  'password123',
  '',
  'manik'
];

async function testPasswords() {
  console.log('🔍 Testing common local PostgreSQL passwords on localhost:5432...');
  for (const pwd of passwords) {
    const url = `postgresql://postgres:${encodeURIComponent(pwd)}@localhost:5432/postgres?schema=public`;
    const prisma = new PrismaClient({
      datasources: { db: { url } },
    });
    try {
      await prisma.$connect();
      console.log(`✅ SUCCESS! Working password found: "${pwd}"`);
      await prisma.$disconnect();
      return pwd;
    } catch (err) {
      console.log(`❌ Password "${pwd}" failed: ${err.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
  console.log('❌ Could not connect with common passwords.');
  return null;
}

testPasswords();
