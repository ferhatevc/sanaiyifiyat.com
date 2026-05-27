import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Railway'in Nixpacks sistemi "npm start" yerine doğrudan "next start" çalıştırdığı için
    // veritabanı şeması güncellenmedi. Bu API, eksik olan AffiliateFeed tablosunu oluşturur.
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`AffiliateFeed\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`url\` TEXT NOT NULL,
        \`vendor\` VARCHAR(191) NOT NULL,
        \`lastSyncAt\` DATETIME(3) NULL,
        \`status\` VARCHAR(191) NOT NULL DEFAULT 'idle',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    return NextResponse.json({ 
      message: "🎉 Veritabanı güncellemesi başarılı! Eksik olan Affiliate tablosu oluşturuldu. Artık /admin sayfasına girebilirsiniz." 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
