import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/validators";
import { createSession } from "@/lib/auth/session";

export const POST = async (request: Request) => {
  const body = await request.json();
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const { email, password, displayName } = parseResult.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Bu e-posta ile hesap mevcut" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
    },
  });

  await createSession(user.id);

  return NextResponse.json({ message: "Kayıt başarılı" }, { status: 201 });
};
