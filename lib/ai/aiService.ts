import { addDays, format } from "date-fns";
import OpenAI from "openai";
import { weatherService, WeatherConditions } from "@/lib/weather/weatherService";

export type WardrobeItem = {
  id: string;
  category: string;
  color: string;
  season: string;
  formality: string;
  imageUrl: string;
};

export type OutfitRole =
  | "TOP"
  | "BOTTOM"
  | "DRESS"
  | "OUTERWEAR"
  | "SHOES"
  | "ACCESSORY"
  | "SOCKS"
  | "OTHER";

export type ProfileSnapshot = {
  id: string;
  name: string;
  ageRange?: string | null;
  gender?: string | null;
  stylePreferences: string[];
  locationCity?: string | null;
};

export type OutfitSuggestionRequest = {
  profile: ProfileSnapshot;
  wardrobe: WardrobeItem[];
  scenario: string;
  startDate: Date;
  endDate?: Date;
};

export type AIOutfitSuggestionItem = {
  clothItemId: string;
  role: OutfitRole;
};

export type AIOutfitSuggestion = {
  date: string;
  items: AIOutfitSuggestionItem[];
  notes: string;
  weather: WeatherConditions;
};

export interface AIService {
  generateOutfits(request: OutfitSuggestionRequest): Promise<AIOutfitSuggestion[]>;
}

const ROLE_OPTIONS: OutfitRole[] = [
  "TOP",
  "BOTTOM",
  "DRESS",
  "OUTERWEAR",
  "SHOES",
  "ACCESSORY",
  "SOCKS",
  "OTHER",
];

const SEASON_VALUES = ["SPRING", "SUMMER", "AUTUMN", "WINTER", "ALL_SEASONS"] as const;
type SeasonValue = (typeof SEASON_VALUES)[number];

const FORMALITY_VALUES = ["CASUAL", "OFFICE", "SPORT", "SPECIAL"] as const;
type FormalityValue = (typeof FORMALITY_VALUES)[number];

const SCENARIO_FORMALITY: Record<string, FormalityValue> = {
  daily: "CASUAL",
  office: "OFFICE",
  travel: "CASUAL",
  special: "SPECIAL",
};

const FORMALITY_COMPATIBILITY: Record<FormalityValue, Partial<Record<FormalityValue, number>>> = {
  CASUAL: { CASUAL: 6, SPORT: 4, SPECIAL: 1, OFFICE: 2 },
  OFFICE: { OFFICE: 6, CASUAL: 3, SPECIAL: 4 },
  SPORT: { SPORT: 6, CASUAL: 4 },
  SPECIAL: { SPECIAL: 6, CASUAL: 2, OFFICE: 3 },
};

const normalizeSeason = (value: string | undefined | null): SeasonValue | "ALL_SEASONS" | null => {
  if (!value) {
    return null;
  }
  const upper = value.toUpperCase();
  if (SEASON_VALUES.includes(upper as SeasonValue)) {
    return upper as SeasonValue;
  }
  if (upper === "ALL_SEASONS") {
    return "ALL_SEASONS";
  }
  return null;
};

const normalizeFormality = (value: string | undefined | null): FormalityValue | null => {
  if (!value) {
    return null;
  }
  const upper = value.toUpperCase();
  if (FORMALITY_VALUES.includes(upper as FormalityValue)) {
    return upper as FormalityValue;
  }
  return null;
};

const inferSeasonFromDate = (date: Date): SeasonValue => {
  const month = date.getUTCMonth() + 1;
  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "AUTUMN";
  return "WINTER";
};

const inferSeasonFromWeather = (weather: WeatherConditions | undefined, date: Date): SeasonValue => {
  if (!weather) {
    return inferSeasonFromDate(date);
  }
  const avgTemp = (weather.temperatureMinC + weather.temperatureMaxC) / 2;
  if (avgTemp <= 6) {
    return "WINTER";
  }
  if (avgTemp <= 15) {
    return "AUTUMN";
  }
  if (avgTemp >= 24) {
    return "SUMMER";
  }
  return "SPRING";
};

const seasonCompatibilityScore = (itemSeasonRaw: string, targetSeason: SeasonValue): number => {
  const itemSeason = normalizeSeason(itemSeasonRaw);
  if (!itemSeason) {
    return 0;
  }
  if (itemSeason === "ALL_SEASONS") {
    return 3;
  }
  if (itemSeason === targetSeason) {
    return 5;
  }
  const adjacency: Record<SeasonValue, SeasonValue[]> = {
    SPRING: ["SUMMER", "WINTER"],
    SUMMER: ["SPRING", "AUTUMN"],
    AUTUMN: ["SUMMER", "WINTER"],
    WINTER: ["AUTUMN", "SPRING"],
    ALL_SEASONS: ["SPRING", "SUMMER", "AUTUMN", "WINTER"],
  };
  return adjacency[targetSeason]?.includes(itemSeason) ? 2 : -4;
};

const formalityCompatibilityScore = (
  itemFormalityRaw: string,
  desiredFormality: FormalityValue
): number => {
  const itemFormality = normalizeFormality(itemFormalityRaw);
  if (!itemFormality) {
    return 0;
  }
  return FORMALITY_COMPATIBILITY[desiredFormality]?.[itemFormality] ?? -3;
};

type RuleBasedContext = {
  wardrobe: WardrobeItem[];
  desiredSeason: SeasonValue;
  desiredFormality: FormalityValue;
  weather?: WeatherConditions;
};

const buildRuleBasedOutfit = (
  context: RuleBasedContext,
  options: { enforceOuterwear?: boolean; encourageAccessories?: boolean } = {}
): AIOutfitSuggestionItem[] => {
  const used = new Set<string>();
  const { wardrobe, desiredFormality, desiredSeason, weather } = context;
  const results: AIOutfitSuggestionItem[] = [];

  const pickBest = (categories: string[], role: OutfitRole): WardrobeItem | null => {
    let best: WardrobeItem | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const item of wardrobe) {
      if (!categories.includes(item.category) || used.has(item.id)) {
        continue;
      }
      const seasonScore = seasonCompatibilityScore(item.season, desiredSeason);
      const formalityScore = formalityCompatibilityScore(item.formality, desiredFormality);
      let score = seasonScore + formalityScore;

      if (role === "OUTERWEAR" && weather) {
        if (weather.temperatureMaxC < 18 || weather.precipitationChance > 0.4) {
          score += 3;
        } else {
          score -= 2;
        }
      }

      if (role === "ACCESSORY" && !options.encourageAccessories) {
        score -= 1;
      }

      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }

    if (best) {
      used.add(best.id);
    }
    return best;
  };

  const tryAdd = (categories: string[], role: OutfitRole) => {
    const item = pickBest(categories, role);
    if (item) {
      results.push({ clothItemId: item.id, role });
      return item;
    }
    return null;
  };

  const dress = tryAdd(["DRESS"], "DRESS");

  if (!dress) {
    let top = tryAdd(["TOP"], "TOP");
    if (!top) {
      top = tryAdd(["OUTERWEAR"], "TOP");
    }
    const bottom = tryAdd(["BOTTOM"], "BOTTOM");

    if (!top && bottom) {
      // fallback: use bottom as main piece but still keep outfit meaningful by adding another layer
      tryAdd(["OUTERWEAR"], "OUTERWEAR");
    }
  }

  const needOuterwear =
    options.enforceOuterwear || (weather ? weather.temperatureMaxC < 16 || weather.precipitationChance > 0.5 : false);
  if (needOuterwear) {
    tryAdd(["OUTERWEAR"], "OUTERWEAR");
  }

  const shoes = tryAdd(["SHOES"], "SHOES");
  if (shoes && weather && weather.temperatureMinC < 18) {
    tryAdd(["SOCKS"], "SOCKS");
  }

  if (options.encourageAccessories) {
    tryAdd(["ACCESSORY"], "ACCESSORY");
  }

  if (results.length === 0 && wardrobe.length > 0) {
    results.push({ clothItemId: wardrobe[0].id, role: "OTHER" });
  }

  return results;
};

const resolveDesiredFormality = (scenario: string): FormalityValue => {
  const key = scenario.toLowerCase();
  return SCENARIO_FORMALITY[key] ?? "CASUAL";
};

const shouldEncourageAccessories = (scenario: string) => scenario.toLowerCase() === "special";

const composeOutfitNote = (
  weather: WeatherConditions | undefined,
  desiredFormality: FormalityValue,
  desiredSeason: SeasonValue
): string => {
  const parts: string[] = [];
  parts.push(`Tarz: ${desiredFormality.toLowerCase()}`);
  if (weather) {
    parts.push(
      `Sıcaklık ${Math.round(weather.temperatureMinC)}-${Math.round(weather.temperatureMaxC)}°C, ` +
        `yağış olasılığı %${Math.round(weather.precipitationChance * 100)}`
    );
  }
  parts.push(`Sezon önerisi: ${desiredSeason.toLowerCase()}`);
  return parts.join(" · ");
};

const mergeWithRuleBasedFallback = (
  rawItems: AIOutfitSuggestionItem[] | undefined,
  context: RuleBasedContext,
  options: { enforceOuterwear?: boolean; encourageAccessories?: boolean } = {}
): AIOutfitSuggestionItem[] => {
  const availableIds = new Set(context.wardrobe.map((item) => item.id));
  const normalized: AIOutfitSuggestionItem[] = [];
  const usedRoles = new Set<OutfitRole>();
  const usedIds = new Set<string>();

  for (const entry of rawItems ?? []) {
    const id = typeof entry.clothItemId === "string" ? entry.clothItemId.trim() : "";
    if (!id || !availableIds.has(id) || usedIds.has(id)) {
      continue;
    }
    const role = ROLE_OPTIONS.includes(entry.role as OutfitRole) ? (entry.role as OutfitRole) : "OTHER";
    if (role !== "OTHER" && usedRoles.has(role)) {
      continue;
    }
    usedRoles.add(role);
    usedIds.add(id);
    normalized.push({ clothItemId: id, role });
  }

  const baseline = buildRuleBasedOutfit(context, options);
  for (const candidate of baseline) {
    if (usedIds.has(candidate.clothItemId)) {
      continue;
    }
    if (candidate.role !== "OTHER" && usedRoles.has(candidate.role)) {
      continue;
    }
    usedIds.add(candidate.clothItemId);
    usedRoles.add(candidate.role);
    normalized.push(candidate);
  }

  return normalized;
};

const formatWardrobe = (wardrobe: WardrobeItem[]): string => {
  return wardrobe
    .map(
      (item) =>
        `- id: ${item.id}, kategori: ${item.category}, renk: ${item.color}, formalite: ${item.formality}, sezon: ${item.season}`
    )
    .join("\n");
};

const buildPrompt = async (
  request: OutfitSuggestionRequest
): Promise<{ prompt: string; weatherByDate: Record<string, WeatherConditions> }> => {
  const { profile, wardrobe, scenario, startDate, endDate } = request;
  const effectiveEnd = endDate ?? startDate;
  const weatherByDate: Record<string, WeatherConditions> = {};
  const dates: Date[] = [];
  let cursor = new Date(startDate);
  while (cursor <= effectiveEnd) {
    const weather = await weatherService.getWeatherForDate({
      location: profile.locationCity ?? "Istanbul",
      date: cursor,
    });
    const key = format(cursor, "yyyy-MM-dd");
    weatherByDate[key] = weather;
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  const weatherSummary = dates
    .map((date) => {
      const key = format(date, "yyyy-MM-dd");
      const weather = weatherByDate[key];
      return `${key}: ${weather.summary}, ${weather.temperatureMinC}-${weather.temperatureMaxC}°C, yağış olasılığı %${Math.round(
        weather.precipitationChance * 100
      )}`;
    })
    .join("\n");

  const prompt = `Bir stil danışmanı olarak hareket et. Kullanıcının profili:\n` +
    `Adı: ${profile.name}\n` +
    `Yaş aralığı: ${profile.ageRange ?? "belirtilmemiş"}\n` +
    `Cinsiyet: ${profile.gender ?? "belirtilmemiş"}\n` +
    `Stil tercihleri: ${profile.stylePreferences.join(", ") || "varsayılan"}\n\n` +
    `Dolaptaki parçalar:\n${formatWardrobe(wardrobe)}\n\n` +
    `Senaryo: ${scenario}.\n` +
    `Tarih aralığı: ${format(startDate, "yyyy-MM-dd")} - ${format(effectiveEnd, "yyyy-MM-dd")}\n` +
    `Hava durumu:\n${weatherSummary}\n\n` +
    `Her gün için JSON çıktısı üret. Çıktı tam olarak şu şemaya uymalı:\n` +
    `{"outfits":[{"date":"YYYY-MM-DD","notes":"kısa açıklama","items":[{"clothItemId":"id","role":"ROL"}]}]}\n` +
    `role alanı sadece şu değerleri alabilir: ${ROLE_OPTIONS.join(",")}. Mümkün olduğunca üst, alt, ayakkabı ve çorap kategorilerinden öneri sun.`;

  return { prompt, weatherByDate };
};

class MockAIService implements AIService {
  async generateOutfits(request: OutfitSuggestionRequest): Promise<AIOutfitSuggestion[]> {
    const { startDate, endDate, wardrobe, scenario } = request;
    const { prompt, weatherByDate } = await buildPrompt(request);

    console.info("AI prompt (mock)", prompt);
    const effectiveEnd = endDate ?? startDate;
    const suggestions: AIOutfitSuggestion[] = [];
    let cursor = new Date(startDate);

    while (cursor <= effectiveEnd) {
      const dateKey = format(cursor, "yyyy-MM-dd");
      const weather = weatherByDate[dateKey];
      const desiredSeason = inferSeasonFromWeather(weather, cursor);
      const desiredFormality = resolveDesiredFormality(scenario);
      const items = buildRuleBasedOutfit(
        {
          wardrobe,
          desiredFormality,
          desiredSeason,
          weather,
        },
        {
          encourageAccessories: shouldEncourageAccessories(scenario),
        }
      );

      suggestions.push({
        date: dateKey,
        items,
        notes: composeOutfitNote(weather, desiredFormality, desiredSeason),
        weather,
      });

      cursor = addDays(cursor, 1);
    }

    return suggestions;
  }
}

const fallbackService = new MockAIService();

class OpenAIService implements AIService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.AI_API_KEY });
    this.model = process.env.AI_MODEL ?? "gpt-4o-mini";
  }

  async generateOutfits(request: OutfitSuggestionRequest): Promise<AIOutfitSuggestion[]> {
    const { prompt, weatherByDate } = await buildPrompt(request);
    const fallbackWeather =
      weatherByDate[Object.keys(weatherByDate)[0] ?? ""] ?? {
        date: request.startDate,
        summary: "Hava bilgisi mevcut değil",
        temperatureMinC: 0,
        temperatureMaxC: 0,
        precipitationChance: 0,
        windSpeedKph: 0,
      };

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Bir stil danışmanısın. Mümkün oldukça üst, alt, ayakkabı ve çorap önerileri içeren kombinler oluştur ve çıktı formatını aynen sağla.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "OutfitSuggestions",
            schema: {
              type: "object",
              properties: {
                outfits: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", format: "date" },
                      notes: { type: "string" },
                      items: {
                        type: "array",
                        minItems: 1,
                        items: {
                          type: "object",
                          properties: {
                            clothItemId: { type: "string" },
                            role: { type: "string", enum: ROLE_OPTIONS },
                          },
                          required: ["clothItemId", "role"],
                        },
                      },
                    },
                    required: ["date", "notes", "items"],
                  },
                  minItems: 1,
                },
              },
              required: ["outfits"],
            },
          },
        },
      });

      const messageContent = completion.choices[0]?.message?.content;
      if (!messageContent) {
        throw new Error("AI cevabı boş");
      }

      const parsed = JSON.parse(messageContent) as {
        outfits: Array<{
          date: string;
          notes: string;
          items: Array<{ clothItemId: string; role: OutfitRole }>;
        }>;
      };

      return parsed.outfits.map((outfit) => {
        const desiredFormality = resolveDesiredFormality(request.scenario);
        const dateValue = outfit.date ? new Date(outfit.date) : request.startDate;
        const weather = weatherByDate[outfit.date] ?? fallbackWeather;
        const desiredSeason = inferSeasonFromWeather(weather, dateValue);
        const sanitizedItems = mergeWithRuleBasedFallback(
          outfit.items,
          {
            wardrobe: request.wardrobe,
            desiredFormality,
            desiredSeason,
            weather,
          },
          {
            encourageAccessories: shouldEncourageAccessories(request.scenario),
          }
        );

        const trimmedNotes = outfit.notes?.trim() ?? "";
        const notes = trimmedNotes.length > 0
          ? trimmedNotes
          : composeOutfitNote(weather, desiredFormality, desiredSeason);

        return {
          date: outfit.date,
          notes,
          items: sanitizedItems,
          weather,
        };
      });
    } catch (error) {
      console.error("OpenAI kombin oluşturma hatası", error);
      return fallbackService.generateOutfits(request);
    }
  }
}

const createLLMService = (): AIService => {
  if (!process.env.AI_API_KEY) {
    return fallbackService;
  }

  return new OpenAIService();
};

export const aiService: AIService = createLLMService();
