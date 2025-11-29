import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { createProfileSchema } from "@/lib/profiles/validators";

export const GET = async () => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ profiles }, { status: 200 });
};

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const body = await request.json();
  const parseResult = createProfileSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const profile = await prisma.profile.create({
    data: {
      userId: session.userId,
      name: parseResult.data.name,
      ageRange: parseResult.data.ageRange,
      gender: parseResult.data.gender,
      locationCity: parseResult.data.locationCity,
      stylePreferences: parseResult.data.stylePreferences,
    },
  });

  return NextResponse.json({ profile }, { status: 201 });
};
