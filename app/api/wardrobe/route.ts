import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { createClothItemSchema, type CreateClothItemInput } from "@/lib/wardrobe/validators";

const ensureProfileOwnership = async (userId: string, profileId: string) => {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return profile;
};

export const GET = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ message: "profileId gerekli" }, { status: 400 });
  }

  try {
    await ensureProfileOwnership(session.userId, profileId);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const items = await prisma.clothItem.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items }, { status: 200 });
};

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const formData = await request.formData();

  const getString = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" ? value : undefined;
  };

  const raw = {
    profileId: getString("profileId"),
    category: getString("category"),
    color: getString("color"),
    material: getString("material"),
    season: getString("season"),
    formality: getString("formality"),
    notes: getString("notes"),
  };

  const parseResult = createClothItemSchema.safeParse(raw);
  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const payload: CreateClothItemInput = parseResult.data;

  try {
    await ensureProfileOwnership(session.userId, payload.profileId);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const file = formData.get("file");
  const imageUrl = typeof file === "object" && file instanceof File
    ? `https://picsum.photos/seed/${file.name}-${Date.now()}/400/600`
    : `https://picsum.photos/seed/${payload.profileId}-${Date.now()}/400/600`;

  const item = await prisma.clothItem.create({
    data: {
      ...payload,
      imageUrl,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
};
