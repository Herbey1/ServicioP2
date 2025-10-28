// ESM
import 'dotenv/config'            // carga .env
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['warn', 'error'] })

try {
  await prisma.$queryRaw`SELECT 1`
  console.log('DB OK')
  process.exit(0)
} catch (e) {
  console.error('DB FAIL:', e.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
