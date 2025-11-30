import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";
import { saveBuffer } from "@/lib/storage/storage";
import { prisma } from "@/lib/db/prisma";

const MODEL_DESCRIBER = process.env.AI_MODEL ?? "gpt-4o-mini";
const IMAGE_MODEL = process.env.GENERATIVE_TRYON_MODEL ?? "gpt-image-1";

const getClient = () => {
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is required for generative try-on");
  }
  return new OpenAI({ apiKey: process.env.AI_API_KEY });
};

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const buildGarmentSummary = (clothItem: {
  category: string;
  color?: string | null;
  formality?: string | null;
  season?: string | null;
  material?: string | null;
  notes?: string | null;
}) => {
  const pieces: string[] = [];

  const color = clothItem.color ? clothItem.color.toLowerCase() : undefined;
  const category = clothItem.category.toLowerCase().replace(/_/g, " ");
  const formality = clothItem.formality ? clothItem.formality.toLowerCase() : undefined;
  const season = clothItem.season ? clothItem.season.toLowerCase() : undefined;
  const material = clothItem.material ? clothItem.material.toLowerCase() : undefined;

  pieces.push(`a ${color ? `${color} ` : ""}${category}`.trim());

  if (formality) {
    pieces.push(`${formality} style`);
  }

  if (season && season !== "all" && season !== "all_seasons") {
    pieces.push(`${season} season appropriate`);
  }

  if (material) {
    pieces.push(`${material} fabric`);
  }

  if (clothItem.notes) {
    pieces.push(clothItem.notes.toLowerCase());
  }

  return pieces.join(", ");
};

const loadImageAsDataUrl = async (imageUrl: string): Promise<{ dataUrl: string; mimeType: string }> => {
  if (imageUrl.startsWith("data:")) {
    const mimeType = imageUrl.slice(5, imageUrl.indexOf(";"));
    return { dataUrl: imageUrl, mimeType };
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = (response.headers.get("content-type") ?? "image/png").split(";")[0];
      const base64 = buffer.toString("base64");
      return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
    } catch (networkError) {
      try {
        const parsed = new URL(imageUrl);
        const fallbackPath = parsed.pathname.replace(/^\/+/, "");
        const filePath = path.join(process.cwd(), "public", fallbackPath);
        const buffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_BY_EXTENSION[ext] ?? "image/png";
        const base64 = buffer.toString("base64");
        return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
      } catch {
        throw new Error(`Model image could not be fetched (${(networkError as Error).message})`);
      }
    }
  }

  const relativePath = imageUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", relativePath);
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[ext] ?? "image/png";
  const base64 = buffer.toString("base64");
  return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
};

const describeModelImage = async (modelImageUrl: string): Promise<string> => {
  const client = getClient();
  const { dataUrl } = await loadImageAsDataUrl(modelImageUrl);
  const response = await client.responses.create({
    model: MODEL_DESCRIBER,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Describe this person in one sentence. Include gender expression, approximate age, hair, pose, and camera framing."
              + " Focus on details that help stylists generate realistic outfits.",
          },
          {
            type: "input_image",
            image_url: dataUrl,
            detail: "high",
          },
        ],
      },
    ],
  });

  const fallback =
    response.output_text?.[0]?.trim() ??
    "A person standing, facing the camera, neutral background, ready for outfit styling.";
  return fallback;
};

const generateImage = async (prompt: string) => {
  const client = getClient();
  const response = await client.images.generate({
    model: IMAGE_MODEL,
    prompt,
    size: "1024x1024",
    quality: "high",
  });

  const imageData = response.data?.[0]?.b64_json;
  if (!imageData) {
    throw new Error("OpenAI did not return an image payload");
  }

  return Buffer.from(imageData, "base64");
};

export type GenerativeTryOnRequest = {
  profileId: string;
  modelImageUrl: string;
  clothItemId?: string;
  garmentPrompt?: string;
};

export const generateGenerativeTryOn = async (
  request: GenerativeTryOnRequest
): Promise<{ imageUrl: string; prompt: string }> => {
  const { profileId, clothItemId, modelImageUrl, garmentPrompt } = request;

  let clothItemSummary: string | null = null;
  if (clothItemId) {
    const clothItem = await prisma.clothItem.findFirst({
      where: { id: clothItemId, profileId },
      select: {
        category: true,
        color: true,
        formality: true,
        season: true,
        material: true,
        notes: true,
      },
    });

    if (!clothItem) {
      throw new Error("Cloth item not found for generative try-on");
    }

    clothItemSummary = buildGarmentSummary(clothItem);
  }

  const modelDescription = await describeModelImage(modelImageUrl);

  const prompt = `Create a photorealistic full-body fashion photo. ${modelDescription}. The person should be wearing ${
    garmentPrompt ?? clothItemSummary ?? "a stylish outfit"
  }. Keep the background minimal and tasteful. Preserve the person's pose and perspective.`;

  const buffer = await generateImage(prompt);

  const imageUrl = await saveBuffer(buffer, {
    profileId,
    folder: "generative-try-on",
    fileName: clothItemId ? `${clothItemId}-generative.png` : undefined,
    mimeType: "image/png",
  });

  return { imageUrl, prompt };
};
