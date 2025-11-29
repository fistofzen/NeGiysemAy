import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";

export const GET = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");
  const date = url.searchParams.get("date");

  if (!profileId || !date) {
    return NextResponse.json({ message: "profileId ve date gerekli" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const parsedDate = new Date(date);

  const outfit = await prisma.outfit.findFirst({
    where: {
      profileId,
      date: parsedDate,
    },
    include: {
      items: {
        include: {
          clothItem: true,
        },
      },
    },
  });

  return NextResponse.json({ outfit }, { status: 200 });
};
