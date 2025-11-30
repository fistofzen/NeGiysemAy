import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Get custom model photos for a profile
export async function GET(request: Request, { params }: Params) {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await prisma.profile.findFirst({
    where: {
      id,
      userId: session.userId,
    },
    select: {
      customModelPhotos: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ message: "Profil bulunamadı" }, { status: 404 });
  }

  // Return template models + custom uploaded models
  const templateModels = [
    { id: "template-1", url: "/templates/models/model1.png", isTemplate: true },
    { id: "template-2", url: "/templates/models/model2.png", isTemplate: true },
    { id: "template-3", url: "/templates/models/model3.png", isTemplate: true },
  ];

  const customModels = profile.customModelPhotos.map((url: string, index: number) => ({
    id: `custom-${index}`,
    url,
    isTemplate: false,
  }));

  return NextResponse.json({
    models: [...templateModels, ...customModels],
  });
}
