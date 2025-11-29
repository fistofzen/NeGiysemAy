import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { analyzeWardrobeImage } from "@/lib/ai/visionService";
import { saveFile } from "@/lib/storage/storage";
import { createClothItemSchema } from "@/lib/wardrobe/validators";

const CATEGORY_VALUES = [
  "TOP",
  "BOTTOM",
  "DRESS",
  "OUTERWEAR",
  "SHOES",
  "SOCKS",
  "ACCESSORY",
] as const;
type CategoryValue = (typeof CATEGORY_VALUES)[number];

const SEASON_VALUES = [
  "SPRING",
  "SUMMER",
  "AUTUMN",
  "WINTER",
  "ALL_SEASONS",
] as const;
type SeasonValue = (typeof SEASON_VALUES)[number];

const FORMALITY_VALUES = ["CASUAL", "OFFICE", "SPORT", "SPECIAL"] as const;
type FormalityValue = (typeof FORMALITY_VALUES)[number];

const CATEGORY_SYNONYMS: Record<string, CategoryValue> = {
  UST: "TOP",
  UST_GIYIM: "TOP",
  USTGIYIM: "TOP",
  ALT: "BOTTOM",
  ALT_GIYIM: "BOTTOM",
  ALTGIYIM: "BOTTOM",
  ELBISE: "DRESS",
  DIS_GIYIM: "OUTERWEAR",
  DISGIYIM: "OUTERWEAR",
  MONT: "OUTERWEAR",
  CEKET: "OUTERWEAR",
  AYAKKABI: "SHOES",
  CORAP: "SOCKS",
  AKSESUAR: "ACCESSORY",
};

const SEASON_SYNONYMS: Record<string, SeasonValue> = {
  ILKBAHAR: "SPRING",
  BAHAR: "SPRING",
  SONBAHAR: "AUTUMN",
  GUZ: "AUTUMN",
  DORT_MEVSIM: "ALL_SEASONS",
  DORTMEVSIM: "ALL_SEASONS",
  BUTUN_MEVSIMLER: "ALL_SEASONS",
  ALL_SEASONS: "ALL_SEASONS",
  ALL: "ALL_SEASONS",
  FALL: "AUTUMN",
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  WINTER: "WINTER",
};

const FORMALITY_SYNONYMS: Record<string, FormalityValue> = {
  GUNLUK: "CASUAL",
  GUNLUK_GIYIM: "CASUAL",
  DAILY: "CASUAL",
  SOKAK: "CASUAL",
  OFFICE: "OFFICE",
  IS: "OFFICE",
  SPOR: "SPORT",
  SPORT: "SPORT",
  OZEL: "SPECIAL",
  OZELOGUN: "SPECIAL",
  DAVET: "SPECIAL",
  EVENT: "SPECIAL",
};

const normalizeKey = (value?: string | null) => {
  if (!value) {
    return undefined;
  }
  const normalized = value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized.length > 0 ? normalized : undefined;
};

const takeString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapCategory = (value?: string | null): CategoryValue | undefined => {
  const key = normalizeKey(value);
  if (!key) {
    return undefined;
  }
  if (CATEGORY_SYNONYMS[key]) {
    return CATEGORY_SYNONYMS[key];
  }
  if (CATEGORY_VALUES.includes(key as CategoryValue)) {
    return key as CategoryValue;
  }
  return undefined;
};

const mapSeason = (value?: string | null): SeasonValue | undefined => {
  const key = normalizeKey(value);
  if (!key) {
    return undefined;
  }
  if (SEASON_SYNONYMS[key]) {
    return SEASON_SYNONYMS[key];
  }
  if (SEASON_VALUES.includes(key as SeasonValue)) {
    return key as SeasonValue;
  }
  return undefined;
};

const mapFormality = (value?: string | null): FormalityValue | undefined => {
  const key = normalizeKey(value);
  if (!key) {
    return undefined;
  }
  if (FORMALITY_SYNONYMS[key]) {
    return FORMALITY_SYNONYMS[key];
  }
  if (FORMALITY_VALUES.includes(key as FormalityValue)) {
    return key as FormalityValue;
  }
  return undefined;
};

const ensureProfileOwnership = async (userId: string, profileId: string) => {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return profile;
};

export const GET = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ message: "profileId gerekli" }, { status: 400 });
  }

  try {
    await ensureProfileOwnership(session.userId, profileId);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const items = await prisma.clothItem.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items }, { status: 200 });
};

export const POST = async (request: Request) => {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });
  }
  const formData = await request.formData();
  const profileId = takeString(formData.get("profileId"));
  if (!profileId) {
    return NextResponse.json({ message: "profileId gerekli" }, { status: 400 });
  }

  try {
    await ensureProfileOwnership(session.userId, profileId);
  } catch {
    return NextResponse.json({ message: "Yetkisiz" }, { status: 403 });
  }

  const file = formData.get("file");
  let dataUrl: string | undefined;

  if (file instanceof File && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || "image/jpeg";
      dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Görsel base64 dönüştürülemedi", error);
    }
  }

  const aiSuggestion = dataUrl ? await analyzeWardrobeImage(dataUrl) : undefined;

  const category =
    mapCategory(takeString(formData.get("category"))) ??
    mapCategory(aiSuggestion?.category) ??
    "TOP";
  const season =
    mapSeason(takeString(formData.get("season"))) ??
    mapSeason(aiSuggestion?.season) ??
    "ALL_SEASONS";
  const formality =
    mapFormality(takeString(formData.get("formality"))) ??
    mapFormality(aiSuggestion?.formality) ??
    "CASUAL";

  const color = takeString(formData.get("color")) ?? aiSuggestion?.color ?? "bilinmiyor";
  const material = takeString(formData.get("material")) ?? aiSuggestion?.material ?? undefined;
  const notes = takeString(formData.get("notes"));

  const parseResult = createClothItemSchema.safeParse({
    profileId,
    category,
    color,
    material,
    season,
    formality,
    notes,
  });

  if (!parseResult.success) {
    return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
  }

  const payload = parseResult.data;

  let imageUrl: string;

  if (typeof file === "object" && file instanceof File && file.size > 0) {
    try {
      imageUrl = await saveFile(file, { profileId });
    } catch (err) {
      console.error("Kıyafet görseli kaydedilemedi", err);
      imageUrl = `https://picsum.photos/seed/${profileId}-${Date.now()}/400/600`;
    }
  } else {
    imageUrl = `https://picsum.photos/seed/${profileId}-${Date.now()}/400/600`;
  }

  const item = await prisma.clothItem.create({
    data: {
      ...payload,
      imageUrl,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
};
