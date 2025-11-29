import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { generateOutfitSchema } from "@/lib/outfits/validators";
import { generateAndStoreOutfits } from "@/lib/outfits/outfitService";

const ensureProfileOwnership = async (userId: string, profileId: string) => {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return profile;
};

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const body = await request.json();
  const parseResult = generateOutfitSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const { profileId, startDate, endDate, scenario } = parseResult.data;

  try {
    await ensureProfileOwnership(session.userId, profileId);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const outfits = await generateAndStoreOutfits({
    profileId,
    startDate,
    endDate,
    scenario,
  });

  return NextResponse.json({ outfits }, { status: 201 });
};
