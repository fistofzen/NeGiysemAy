import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveSession } from "@/lib/auth/session";
import { requireActiveProfile } from "@/lib/profiles/active-profile";
import { prisma } from "@/lib/db/prisma";
import { generateGenerativeTryOn } from "@/lib/ai/generativeTryOnService";

const requestSchema = z.object({
  modelImageUrl: z.string().min(1),
  clothItemId: z.string().optional(),
  clothItemIds: z.array(z.string()).optional(), // Kombin için çoklu kıyafetler
  garmentPrompt: z.string().optional(),
  profileId: z.string().optional(),
});

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid JSON body", error);
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Zorunlu alanlar eksik", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const { modelImageUrl, clothItemId, clothItemIds, garmentPrompt, profileId: explicitProfileId } = parsed.data;
    const { origin } = new URL(request.url);

    const toAbsoluteUrl = (value: string) => {
      if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
      }
      return new URL(value, origin).toString();
    };

    const profile = explicitProfileId
      ? await prisma.profile.findFirst({
          where: { id: explicitProfileId, userId: session.userId },
          select: { id: true },
        })
      : await requireActiveProfile(session.userId);

    if (!profile) {
      return NextResponse.json({ message: "Profil bulunamadı" }, { status: 404 });
    }

    const result = await generateGenerativeTryOn({
      profileId: profile.id,
      clothItemId,
      clothItemIds,
      modelImageUrl: toAbsoluteUrl(modelImageUrl),
      garmentPrompt,
    });

    return NextResponse.json({
      message: "Başarılı",
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      provider: "openai-gpt-image",
    });
  } catch (error) {
    console.error("Generative try-on failed", error);
    return NextResponse.json(
      {
        message: "Generative try-on başarısız",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
