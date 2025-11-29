import { OutfitItemRole, OutfitScenario } from "@prisma/client";
import { formatISO } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { aiService } from "@/lib/ai/aiService";
import type { AIOutfitSuggestion } from "@/lib/ai/aiService";

type ProfileWithWardrobe = {
  id: string;
  name: string;
  ageRange: string | null;
  gender: string | null;
  stylePreferences: string[];
  locationCity: string | null;
  clothItems: Array<{
    id: string;
    category: string;
    color: string;
    season: string;
    formality: string;
    imageUrl: string;
  }>;
};

type OutfitRecord = {
  id: string;
  profileId: string;
  date: Date;
  scenario: OutfitScenario;
  notes: string | null;
  weatherSummary: string | null;
};

type OutfitWithItems = OutfitRecord & {
  items: Array<{
    id: string;
    clothItemId: string;
    role: OutfitItemRole;
    clothItem?: {
      category: string;
      color: string;
      imageUrl: string;
    } | null;
  }>;
};

const scenarioMap: Record<string, OutfitScenario> = {
  daily: OutfitScenario.DAILY,
  office: OutfitScenario.OFFICE,
  travel: OutfitScenario.TRAVEL,
  special: OutfitScenario.SPECIAL,
};

const outfitRoleMap: Record<string, OutfitItemRole> = {
  TOP: OutfitItemRole.TOP,
  BOTTOM: OutfitItemRole.BOTTOM,
  SHOES: OutfitItemRole.SHOES,
  OUTERWEAR: OutfitItemRole.OUTERWEAR,
  ACCESSORY: OutfitItemRole.ACCESSORY,
  SOCKS: OutfitItemRole.SOCKS,
  DRESS: OutfitItemRole.DRESS,
  OTHER: OutfitItemRole.OTHER,
};

const resolveRole = (role: string): OutfitItemRole => {
  return outfitRoleMap[role.toUpperCase()] ?? OutfitItemRole.OTHER;
};

const resolveScenario = (value: string): OutfitScenario => {
  const key = value.toLowerCase();
  if (!(key in scenarioMap)) {
    return OutfitScenario.DAILY;
  }
  return scenarioMap[key];
};

type GenerateParams = {
  profileId: string;
  startDate: Date;
  endDate?: Date;
  scenario: string;
};

export const generateAndStoreOutfits = async ({
  profileId,
  startDate,
  endDate,
  scenario,
}: GenerateParams) => {
  const profile = (await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      clothItems: true,
    },
  })) as ProfileWithWardrobe | null;

  if (!profile) {
    throw new Error("Profile not found");
  }

  const wardrobe = profile.clothItems.map((item: ProfileWithWardrobe["clothItems"][number]) => ({
    id: item.id,
    category: item.category,
    color: item.color,
    season: item.season,
    formality: item.formality,
    imageUrl: item.imageUrl,
  }));

  const suggestions = await aiService.generateOutfits({
    profile: {
      id: profile.id,
      name: profile.name,
      ageRange: profile.ageRange,
      gender: profile.gender,
      stylePreferences: profile.stylePreferences,
      locationCity: profile.locationCity,
    },
    wardrobe,
    scenario,
    startDate,
    endDate,
  });

  const prismaScenario = resolveScenario(scenario);

  const savedOutfits = await Promise.all<OutfitWithItems>(
    suggestions.map(async (suggestion: AIOutfitSuggestion) => {
      const formattedDate = new Date(suggestion.date);

      const outfit = (await prisma.outfit.upsert({
        where: {
          profileId_date_scenario: {
            profileId,
            date: formattedDate,
            scenario: prismaScenario,
          },
        },
        create: {
          profileId,
          date: formattedDate,
          scenario: prismaScenario,
          notes: suggestion.notes,
          weatherSummary: suggestion.weather.summary,
        },
        update: {
          notes: suggestion.notes,
          weatherSummary: suggestion.weather.summary,
        },
      })) as OutfitRecord;

      await prisma.outfitItem.deleteMany({ where: { outfitId: outfit.id } });

      if (suggestion.items.length > 0) {
        await prisma.outfitItem.createMany({
          data: suggestion.items.map((item) => ({
            outfitId: outfit.id,
            clothItemId: item.clothItemId,
            role: resolveRole(item.role),
          })),
        });
      }

      const outfitWithItems = await prisma.outfit.findUnique({
        where: { id: outfit.id },
        include: {
          items: {
            include: {
              clothItem: true,
            },
          },
        },
      });

      if (!outfitWithItems) {
        throw new Error("Outfit could not be retrieved");
      }

      return outfitWithItems;
    })
  );

  return savedOutfits.map((outfit) => ({
    id: outfit.id,
    profileId: outfit.profileId,
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
  }));
};
