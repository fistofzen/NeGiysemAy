import OpenAI from "openai";

export type WardrobeInference = {
  category?: string;
  color?: string;
  material?: string;
  season?: string;
  formality?: string;
};

export interface VisionService {
  analyze(imageDataUrl: string): Promise<WardrobeInference>;
}

const FALLBACK_SUGGESTION: WardrobeInference = {
  category: "TOP",
  color: "beyaz",
  material: "pamuk",
  season: "ALL_SEASONS",
  formality: "CASUAL",
};

class MockVisionService implements VisionService {
  async analyze(): Promise<WardrobeInference> {
    return FALLBACK_SUGGESTION;
  }
}

class OpenAIVisionService implements VisionService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.AI_API_KEY });
    this.model = process.env.AI_VISION_MODEL ?? "gpt-4.1-mini";
  }

  async analyze(imageDataUrl: string): Promise<WardrobeInference> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Sen bir stil ve kumaş uzmanısın. Verilen kıyafet fotoğrafını analiz ederek aşağıdaki bilgileri JSON formatında döndür: category (TOP, BOTTOM, DRESS, OUTERWEAR, SHOES, SOCKS, ACCESSORY), color (Türkçe temel renk), material (kısa kumaş tanımı), season (SPRING, SUMMER, AUTUMN, WINTER, ALL_SEASONS) ve formality (CASUAL, OFFICE, SPORT, SPECIAL).",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Lütfen sadece JSON döndür.",
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("Boş yanıt");
    }
    const sanitized = extractJsonPayload(content);
    const parsed = parseWardrobeInference(sanitized);
    if (parsed) {
      return parsed;
    }

    console.warn("AI yanıtı çözümlenemedi, varsayılana düşülüyor", sanitized);
    return FALLBACK_SUGGESTION;
  }
}

const extractJsonPayload = (payload: string) => {
  const trimmed = payload.trim();

  if (trimmed.startsWith("```")) {
    const fencedMatch = trimmed.match(/```[a-zA-Z]*\s*([\s\S]*?)```/);
    if (fencedMatch && fencedMatch[1]) {
      return fencedMatch[1].trim();
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
};

const parseWardrobeInference = (raw: string): WardrobeInference | null => {
  const attempts = [raw, raw.trim()];

  const strippedTicks = raw.trim().replace(/^[`"']+/, "").replace(/[`"']+$/, "");
  if (!attempts.includes(strippedTicks)) {
    attempts.push(strippedTicks);
  }

  const jsonOnlyMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonOnlyMatch && !attempts.includes(jsonOnlyMatch[0])) {
    attempts.push(jsonOnlyMatch[0]);
  }

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as WardrobeInference;
    } catch {
      // continue trying
    }
  }

  return null;
};

const createVisionService = (): VisionService => {
  if (!process.env.AI_API_KEY) {
    return new MockVisionService();
  }

  try {
    return new OpenAIVisionService();
  } catch (error) {
    console.error("Vision servisi başlatılamadı", error);
    return new MockVisionService();
  }
};

const visionService = createVisionService();

export const analyzeWardrobeImage = async (imageDataUrl: string) => {
  try {
    return await visionService.analyze(imageDataUrl);
  } catch (error) {
    console.error("Görsel analizi başarısız", error);
    return FALLBACK_SUGGESTION;
  }
};
