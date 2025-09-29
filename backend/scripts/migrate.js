import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  try {
    // Проверяем подключение к БД
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Запускаем миграции
    console.log('📦 Running Prisma migrations...');
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    if (stderr) {
      console.warn('⚠️ Migration warnings:', stderr);
    }
    
    console.log('✅ Migrations completed successfully');
    console.log(stdout);
    
    // Генерируем Prisma Client
    console.log('🔧 Generating Prisma Client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma Client generated');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();
