import { redirect } from "next/navigation";
import { formatISO } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { getActiveProfile } from "@/lib/profiles/active-profile";
import AppShell from "@/components/layout/app-shell";
import DashboardClient from "@/app/dashboard/dashboard-client";

type DashboardProfileRecord = {
  id: string;
  name: string;
  clothItems: Array<{
    id: string;
    imageUrl: string;
    category: string;
    color: string;
    season: string;
    formality: string;
  }>;
  outfits: Array<{
    id: string;
    date: Date;
    scenario: string;
    notes: string | null;
    weatherSummary: string | null;
    items: Array<{
      id: string;
      clothItemId: string;
      role: string;
      clothItem?: {
        category: string;
        color: string;
        imageUrl: string;
      } | null;
    }>;
  }>;
};

const DashboardPage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const userId = session.userId;

  const profiles = (await prisma.profile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      clothItems: true,
      outfits: {
        include: {
          items: {
            include: {
              clothItem: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 14,
      },
    },
  })) as DashboardProfileRecord[];

  if (profiles.length === 0) {
    redirect("/profiles/select");
    return null;
  }

  const activeProfile = await getActiveProfile(userId);
  if (!activeProfile) {
    redirect("/profiles/select");
    return null;
  }

  const formattedProfiles = profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    wardrobe: profile.clothItems.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      category: item.category,
      color: item.color,
      season: item.season,
      formality: item.formality,
    })),
    outfits: profile.outfits.map((outfit) => ({
      id: outfit.id,
      date: formatISO(outfit.date, { representation: "date" }),
      scenario: outfit.scenario,
      notes: outfit.notes,
      weatherSummary: outfit.weatherSummary,
      items: outfit.items.map((item) => ({
        id: item.id,
        clothItemId: item.clothItemId,
        role: item.role,
        category: item.clothItem?.category ?? "",
        color: item.clothItem?.color ?? "",
        imageUrl: item.clothItem?.imageUrl ?? "/placeholder.png",
      })),
    })),
  }));

  return (
    <AppShell activeProfileName={profiles.find((profile) => profile.id === activeProfile.id)?.name}>
      <DashboardClient
        initialProfiles={formattedProfiles}
        initialDate={formatISO(new Date(), { representation: "date" })}
        activeProfileId={activeProfile.id}
      />
    </AppShell>
  );
};

export default DashboardPage;
