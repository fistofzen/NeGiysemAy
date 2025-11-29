import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { getActiveProfile } from "@/lib/profiles/active-profile";
import AppShell from "@/components/layout/app-shell";
import { WardrobeClient } from "@/app/wardrobe/wardrobe-client";

type WardrobeProfileRecord = {
  id: string;
  name: string;
  clothItems: Array<{
    id: string;
    imageUrl: string;
    category: string;
    color: string;
    season: string;
    formality: string;
    material: string | null;
    notes: string | null;
  }>;
};

const WardrobePage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const activeProfile = await getActiveProfile(session.userId);
  if (!activeProfile) {
    redirect("/profiles/select");
    return null;
  }

  const profile = (await prisma.profile.findUnique({
    where: { id: activeProfile.id },
    include: {
      clothItems: {
        orderBy: { createdAt: "desc" },
      },
    },
  })) as WardrobeProfileRecord | null;

  if (!profile) {
    redirect("/profiles/select");
    return null;
  }

  const categoryOptions = CATEGORY_VALUES.map((value) => ({
    label: categoryLabel(value),
    value,
  }));

  const seasonOptions = SEASON_VALUES.map((value) => ({
    label: seasonLabel(value),
    value,
  }));

  const formalityOptions = FORMALITY_VALUES.map((value) => ({
    label: formalityLabel(value),
    value,
  }));

  return (
    <AppShell activeProfileName={profile.name}>
      <WardrobeClient
        profileId={profile.id}
        profileName={profile.name}
        items={profile.clothItems}
        categoryOptions={categoryOptions}
        seasonOptions={seasonOptions}
        formalityOptions={formalityOptions}
      />
    </AppShell>
  );
};

const CATEGORY_VALUES = [
  "TOP",
  "BOTTOM",
  "DRESS",
  "OUTERWEAR",
  "SHOES",
  "SOCKS",
  "ACCESSORY",
] as const;

const SEASON_VALUES = ["SPRING", "SUMMER", "AUTUMN", "WINTER", "ALL_SEASONS"] as const;

const FORMALITY_VALUES = ["CASUAL", "OFFICE", "SPORT", "SPECIAL"] as const;

const categoryLabel = (value: (typeof CATEGORY_VALUES)[number]): string => {
  const labels: Record<(typeof CATEGORY_VALUES)[number], string> = {
    TOP: "Üst",
    BOTTOM: "Alt",
    DRESS: "Elbise",
    OUTERWEAR: "Dış giyim",
    SHOES: "Ayakkabı",
    SOCKS: "Çorap",
    ACCESSORY: "Aksesuar",
  };
  return labels[value] ?? value;
};

const seasonLabel = (value: (typeof SEASON_VALUES)[number]): string => {
  const labels: Record<(typeof SEASON_VALUES)[number], string> = {
    SPRING: "İlkbahar",
    SUMMER: "Yaz",
    AUTUMN: "Sonbahar",
    WINTER: "Kış",
    ALL_SEASONS: "Dört mevsim",
  };
  return labels[value] ?? value;
};

const formalityLabel = (value: (typeof FORMALITY_VALUES)[number]): string => {
  const labels: Record<(typeof FORMALITY_VALUES)[number], string> = {
    CASUAL: "Günlük",
    OFFICE: "Ofis",
    SPORT: "Spor",
    SPECIAL: "Özel gün",
  };
  return labels[value] ?? value;
};

export default WardrobePage;
