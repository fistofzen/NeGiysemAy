import { cookies } from "next/headers";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db/prisma";

const ACTIVE_PROFILE_COOKIE = "nga_profile";
const PROFILE_COOKIE_TTL_DAYS = 30;

type ActiveProfile = {
  id: string;
  userId: string;
};

const readProfileCookie = (): string | undefined => {
  return cookies().get(ACTIVE_PROFILE_COOKIE)?.value;
};

const persistProfileCookie = (profileId: string) => {
  const expires = addDays(new Date(), PROFILE_COOKIE_TTL_DAYS);
  cookies().set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
};

export const clearProfileCookie = () => {
  cookies().delete(ACTIVE_PROFILE_COOKIE);
};

export const setActiveProfile = async (userId: string, profileId: string): Promise<ActiveProfile> => {
  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!profile) {
    throw new Error("Profil bulunamadı");
  }

  persistProfileCookie(profile.id);
  return profile;
};

export const getActiveProfile = async (userId: string): Promise<ActiveProfile | null> => {
  const profileId = readProfileCookie();

  if (!profileId) {
    return null;
  }

  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!profile) {
    clearProfileCookie();
    return null;
  }

  return profile;
};

export const requireActiveProfile = async (userId: string): Promise<ActiveProfile> => {
  const profile = await getActiveProfile(userId);
  if (!profile) {
    throw new Error("Aktif profil bulunamadı");
  }
  return profile;
};
