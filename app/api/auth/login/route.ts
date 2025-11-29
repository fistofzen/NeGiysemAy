import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validators";
import { createSession } from "@/lib/auth/session";

export const POST = async (request: Request) => {
  const body = await request.json();
  const parseResult = loginSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz bilgiler" }, { status: 400 });
  }

  const { email, password } = parseResult.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return NextResponse.json({ message: "Şifre hatalı" }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ message: "Giriş başarılı" }, { status: 200 });
};
