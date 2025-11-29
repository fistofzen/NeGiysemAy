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

const selectItemFactory = (wardrobe: WardrobeItem[]) => {
  const grouped = wardrobe.reduce<Record<string, WardrobeItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const pointers: Record<string, number> = {};

  return (categories: string[]): WardrobeItem | null => {
    for (const category of categories) {
      const items = grouped[category];
      if (!items || items.length === 0) {
        continue;
      }
      const pointer = pointers[category] ?? 0;
      const item = items[pointer % items.length];
      pointers[category] = pointer + 1;
      return item;
    }
    return null;
  };
};

class MockAIService implements AIService {
  async generateOutfits(request: OutfitSuggestionRequest): Promise<AIOutfitSuggestion[]> {
    const { startDate, endDate, wardrobe } = request;
    const { prompt, weatherByDate } = await buildPrompt(request);

    console.info("AI prompt (mock)", prompt);

    const takeItem = selectItemFactory(wardrobe);
    const effectiveEnd = endDate ?? startDate;
    const suggestions: AIOutfitSuggestion[] = [];
    let cursor = new Date(startDate);

    while (cursor <= effectiveEnd) {
      const dateKey = format(cursor, "yyyy-MM-dd");
      const items: AIOutfitSuggestionItem[] = [];

      const topItem = takeItem(["TOP", "DRESS"]);
      if (topItem) {
        items.push({
          clothItemId: topItem.id,
          role: topItem.category === "DRESS" ? "DRESS" : "TOP",
        });
      }

      const needsBottom = !topItem || topItem.category !== "DRESS";
      if (needsBottom) {
        const bottomItem = takeItem(["BOTTOM"]);
        if (bottomItem) {
          items.push({ clothItemId: bottomItem.id, role: "BOTTOM" });
        }
      }

      const shoes = takeItem(["SHOES"]);
      if (shoes) {
        items.push({ clothItemId: shoes.id, role: "SHOES" });
      }

      const socks = takeItem(["SOCKS"]);
      if (socks) {
        items.push({ clothItemId: socks.id, role: "SOCKS" });
      }

      const outerwear = takeItem(["OUTERWEAR"]);
      if (outerwear) {
        items.push({ clothItemId: outerwear.id, role: "OUTERWEAR" });
      }

      const accessory = takeItem(["ACCESSORY"]);
      if (accessory) {
        items.push({ clothItemId: accessory.id, role: "ACCESSORY" });
      }

      if (items.length === 0 && wardrobe[0]) {
        items.push({ clothItemId: wardrobe[0].id, role: "OTHER" });
      }

      suggestions.push({
        date: dateKey,
        items,
        notes: "Hava durumuna göre katmanlı giyinmeyi unutma.",
        weather: weatherByDate[dateKey],
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

      return parsed.outfits.map((outfit) => ({
        date: outfit.date,
        notes: outfit.notes,
        items: outfit.items,
        weather: weatherByDate[outfit.date] ?? fallbackWeather,
      }));
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
