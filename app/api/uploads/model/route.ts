import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { requireActiveProfile } from "@/lib/profiles/active-profile";
import { saveFile } from "@/lib/storage/storage";

const profileSchema = z.string().min(1).optional();

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const profileIdValue = formData.get("profileId");

  const profileIdResult = profileSchema.safeParse(profileIdValue ?? undefined);
  if (!profileIdResult.success) {
    return NextResponse.json({ message: "Profil bilgisi geçersiz" }, { status: 422 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Dosya gerekli" }, { status: 400 });
  }

  const profile = profileIdResult.data
    ? await prisma.profile.findFirst({
        where: { id: profileIdResult.data, userId: session.userId },
        select: { id: true },
      })
    : await requireActiveProfile(session.userId);

  if (!profile) {
    return NextResponse.json({ message: "Profil bulunamadı" }, { status: 404 });
  }

  const url = await saveFile(file, { profileId: profile.id, folder: "model-photos" });
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const absoluteUrl = url.startsWith("http") ? url : new URL(url, origin).toString();

  // Save photo URL to profile
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      customModelPhotos: {
        push: url,
      },
    },
  });

  return NextResponse.json({ url, absoluteUrl }, { status: 201 });
};
