import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { removeFile } from "@/lib/storage/storage";

type RouteContext = {
  params: {
    itemId: string;
  };
};

export const DELETE = async (_request: Request, { params }: RouteContext) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const itemId = params.itemId;
  if (!itemId) {
    return NextResponse.json({ message: "itemId gerekli" }, { status: 400 });
  }

  const item = await prisma.clothItem.findUnique({
    where: { id: itemId },
    include: {
      profile: { select: { userId: true } },
    },
  });

  if (!item || item.profile.userId !== session.userId) {
    return NextResponse.json({ message: "Kayıt bulunamadı" }, { status: 404 });
  }

  await removeFile(item.imageUrl);
  await prisma.clothItem.delete({ where: { id: itemId } });

  return NextResponse.json({ message: "Silindi" }, { status: 200 });
};
