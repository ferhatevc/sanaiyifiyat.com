"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function createPriceAlarm(productId: string, targetPrice: number) {
  const session = await getSession();

  if (!session || !session.userId) {
    return { error: "Alarm kurmak için giriş yapmalısınız." };
  }

  // Aynı ürün için zaten alarm var mı kontrol et
  const existingAlarm = await prisma.priceAlarm.findFirst({
    where: {
      userId: session.userId,
      productId: productId
    }
  });

  if (existingAlarm) {
    // Varsa güncelle
    await prisma.priceAlarm.update({
      where: { id: existingAlarm.id },
      data: { targetPrice, isActive: true }
    });
    return { success: "Fiyat alarmınız güncellendi!" };
  }

  // Yoksa yeni oluştur
  await prisma.priceAlarm.create({
    data: {
      userId: session.userId,
      productId: productId,
      targetPrice: targetPrice
    }
  });

  return { success: "Fiyat alarmınız başarıyla kuruldu!" };
}
