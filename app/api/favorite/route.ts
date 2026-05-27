import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Ürün ID gerekli." }, { status: 400 });
    }

    const userId = session.userId as string;

    // Toggle: Varsa sil, yoksa ekle
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", message: "Favorilerden çıkarıldı." });
    } else {
      await prisma.favorite.create({ data: { userId, productId } });
      return NextResponse.json({ action: "added", message: "Favorilere eklendi." });
    }
  } catch (error: any) {
    console.error("Favori hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
