"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";


export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  // E-posta kontrolü
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Bu e-posta adresi zaten kullanılıyor." };
  }

  // Şifreyi hashle
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Kullanıcıyı oluştur
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Oturum oluştur
  await createSession(user.id, user.name);

  return { success: true };
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Lütfen e-posta ve şifrenizi girin." };
  }

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Bu e-posta adresine kayıtlı hesap bulunamadı." };
  }

  // Şifreyi kontrol et
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "Hatalı şifre girdiniz." };
  }

  // Oturum oluştur
  await createSession(user.id, user.name);

  return { success: true };
}

export async function logoutUser() {
  await deleteSession();
  redirect("/");
}
