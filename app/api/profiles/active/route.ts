import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth/session";
import { setActiveProfile, clearProfileCookie } from "@/lib/profiles/active-profile";

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profileId = body?.profileId;

  if (typeof profileId !== "string") {
    return NextResponse.json({ message: "Profil id gerekli" }, { status: 400 });
  }

  try {
    await setActiveProfile(session.userId, profileId);
    return NextResponse.json({ profileId }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Profil atanamadı" }, { status: 403 });
  }
};

export const DELETE = async () => {
  clearProfileCookie();
  return NextResponse.json({ success: true }, { status: 200 });
};
