import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { requireActiveProfile } from "@/lib/profiles/active-profile";
import { virtualTryOnService } from "@/lib/ai/vtonService";

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
  }

  try {
    const { clothItemId, garmentImageUrl, profileId: explicitProfileId, modelImageUrl, providerHints } = json;

    const profile = explicitProfileId
      ? await prisma.profile.findFirst({
          where: { id: explicitProfileId, userId: session.userId },
          select: { id: true },
        })
      : await requireActiveProfile(session.userId);

    if (!profile) {
      return NextResponse.json({ message: "Profil bulunamadı" }, { status: 404 });
    }

    let finalGarmentUrl = garmentImageUrl ?? undefined;
    if (clothItemId) {
      const clothItem = await prisma.clothItem.findFirst({
        where: { id: clothItemId, profileId: profile.id },
        select: { imageUrl: true },
      });

      if (!clothItem) {
        return NextResponse.json({ message: "Kıyafet bulunamadı" }, { status: 404 });
      }

      finalGarmentUrl = clothItem.imageUrl ?? finalGarmentUrl;
    }

    if (!finalGarmentUrl) {
      return NextResponse.json({ message: "Kıyafet görseli gerekli" }, { status: 400 });
    }

    const result = await virtualTryOnService.generate({
      clothItemId,
      garmentImageUrl: finalGarmentUrl,
      modelImageUrl,
      profileId: profile.id,
      providerHints,
    });

    if (!result) {
      return NextResponse.json({
        message: "VTON yapılandırması eksik veya servis yanıtı alınamadı",
        status: "skipped",
      });
    }

    return NextResponse.json({
      message: "Başarılı",
      imageUrl: result.imageUrl,
      provider: result.provider,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("VTON isteği başarısız", error);
    return NextResponse.json({ message: "VTON isteği başarısız" }, { status: 500 });
  }
};
