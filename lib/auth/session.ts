import { cookies } from "next/headers";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { clearProfileCookie } from "@/lib/profiles/active-profile";

const SESSION_COOKIE = "nga_session";
const SESSION_DURATION_DAYS = 7;

type SessionPayload = {
  token: string;
  userId: string;
  expiresAt: Date;
};

const readSessionCookie = (): string | undefined => {
  return cookies().get(SESSION_COOKIE)?.value;
};

const persistSessionCookie = (token: string, expiresAt: Date) => {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
};

export const createSession = async (userId: string): Promise<SessionPayload> => {
  const token = crypto.randomUUID();
  const expiresAt = addDays(new Date(), SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  persistSessionCookie(token, expiresAt);
  clearProfileCookie();

  return { token, userId, expiresAt };
};

export const getActiveSession = async (): Promise<SessionPayload | null> => {
  const token = readSessionCookie();

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  return {
    token: session.token,
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
};

export const requireSession = async (): Promise<SessionPayload> => {
  const session = await getActiveSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
};

export const clearSession = async () => {
  const token = readSessionCookie();
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookies().delete(SESSION_COOKIE);
  }
  clearProfileCookie();
};
