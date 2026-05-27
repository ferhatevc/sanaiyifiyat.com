import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Yorum yapabilmek için giriş yapmalısınız." }, { status: 401 });
    }

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Puan 1-5 arasında olmalıdır." }, { status: 400 });
    }

    await prisma.review.create({
      data: {
        userId: session.userId as string,
        productId,
        rating,
        comment: comment.substring(0, 500), // Max 500 karakter
      }
    });

    // Ürün sayfasına yönlendir
    return NextResponse.redirect(new URL(`/product/${productId}`, request.url));
  } catch (error: any) {
    console.error("Yorum ekleme hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
