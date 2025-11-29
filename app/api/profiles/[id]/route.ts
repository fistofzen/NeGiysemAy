import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/profiles/validators";

const ensureOwnership = async (userId: string, profileId: string) => {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return profile;
};

export const PUT = async (request: Request, { params }: { params: { id: string } }) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const { id } = params;
  try {
    await ensureOwnership(session.userId, id);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const body = await request.json();
  const parseResult = updateProfileSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const profile = await prisma.profile.update({
    where: { id },
    data: parseResult.data,
  });

  return NextResponse.json({ profile }, { status: 200 });
};

export const DELETE = async (_request: Request, { params }: { params: { id: string } }) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const { id } = params;
  try {
    await ensureOwnership(session.userId, id);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  await prisma.profile.delete({ where: { id } });

  return NextResponse.json({ message: "Profil silindi" }, { status: 200 });
};
