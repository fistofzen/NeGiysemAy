import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";

export const getCurrentUser = async () => {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
  });
};
