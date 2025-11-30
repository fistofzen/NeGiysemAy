import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveSession } from "@/lib/auth/session";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: Params) {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;

  // Check if outfit exists and belongs to user
  const outfit = await prisma.outfit.findUnique({
    where: { id },
    include: {
      profile: {
        select: { userId: true },
      },
    },
  });

  if (!outfit) {
    return NextResponse.json({ message: "Kombin bulunamadı" }, { status: 404 });
  }

  if (outfit.profile.userId !== session.userId) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  // Delete outfit (cascade will delete outfit items)
  await prisma.outfit.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Kombin silindi" }, { status: 200 });
}
