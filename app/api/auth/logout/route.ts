import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export const POST = async () => {
  await clearSession();
  return NextResponse.json({ message: "Çıkış yapıldı" }, { status: 200 });
};
