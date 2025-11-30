import { promises as fs } from "fs";
import path from "path";
import { saveBuffer } from "@/lib/storage/storage";
import { buildVtonEndpoint, getAccessToken } from "@/lib/google/vertexClient";

export type VirtualTryOnRequest = {
  garmentImageUrl: string;
  modelImageUrl: string;
  profileId?: string;
  clothItemId?: string;
  providerHints?: Record<string, unknown>;
};

export type VirtualTryOnResult = {
  imageUrl: string;
  provider: string;
  metadata?: Record<string, unknown>;
};

const rawProvider = process.env.VTON_PROVIDER_NAME ?? "generic";
const PROVIDER_LABEL = rawProvider.trim() || "generic";
const PROVIDER_KEY = PROVIDER_LABEL.toLowerCase();
const API_URL = process.env.VTON_API_URL;
const API_KEY = process.env.VTON_API_KEY;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const decodeBase64Image = (value: string | undefined | null): Buffer | null => {
  if (!value) {
    return null;
  }
  const cleaned = value.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  try {
    return Buffer.from(cleaned, "base64");
  } catch (error) {
    console.error("Failed to decode base64 image", error);
    return null;
  }
};

const extractMimeType = (value: string | undefined | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const match = value.match(/^data:(?<mime>[^;]+);base64/);
  return match?.groups?.mime;
};

const loadImageBuffer = async (imageUrl: string): Promise<{ buffer: Buffer; mimeType: string }> => {
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:(?<mime>[^;]+);base64,(?<data>.+)$/);
    if (!match?.groups?.data) {
      throw new Error("Invalid data URL provided for image");
    }
    const mimeType = match.groups.mime ?? "image/png";
    return { buffer: Buffer.from(match.groups.data, "base64"), mimeType };
  }

  const readLocalFile = async (relative: string) => {
    const normalized = relative.replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), "public", normalized);
    const buffer = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const mimeType = MIME_BY_EXTENSION[ext] ?? "image/png";
    return { buffer, mimeType };
  };

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") ?? "image/png";
      const mimeType = contentType.split(";")[0];
      return { buffer, mimeType };
    } catch (networkError) {
      try {
        const parsed = new URL(imageUrl);
        return await readLocalFile(parsed.pathname);
      } catch {
        throw new Error(`Image fetch failed: ${(networkError as Error).message}`);
      }
    }
  }

  return readLocalFile(imageUrl);
};

export class VirtualTryOnService {
  async generate(request: VirtualTryOnRequest): Promise<VirtualTryOnResult | null> {
    console.log(`Using VTON provider: ${PROVIDER_LABEL}`);
    if (PROVIDER_KEY === "vertex") {
      return this.generateWithVertex(request);
    }

    if (!API_URL || !API_KEY) {
      console.warn("VTON configuration is incomplete; skipping virtual try-on call");
      return null;
    }

    return this.generateWithGeneric(request);
  }

  private async generateWithGeneric(payload: VirtualTryOnRequest): Promise<VirtualTryOnResult | null> {
    const body = {
      garment_image_url: payload.garmentImageUrl,
      model_image_url: payload.modelImageUrl,
      cloth_item_id: payload.clothItemId,
      ...payload.providerHints,
    } satisfies Record<string, unknown>;

    const response = await fetch(API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error("VTON provider error", response.status, errorPayload);
      throw new Error(`VTON provider responded with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const raw: unknown = await response.json();
      const data = raw as Record<string, unknown>;
      const base64Image = data.result_image_base64 ?? data.image_base64 ?? data.imageBase64;
      const imageUrl = data.result_image_url ?? data.image_url ?? data.imageUrl;

      if (imageUrl) {
        return { imageUrl: imageUrl as string, provider: PROVIDER_LABEL, metadata: data };
      }

      const buffer = decodeBase64Image(base64Image as string | undefined);
      if (!buffer) {
        console.error("VTON provider did not return a usable image payload", data);
        throw new Error("No valid image in response");
      }

      const mimeType = extractMimeType(base64Image as string | null | undefined);
      const storedUrl = await saveBuffer(buffer, {
        mimeType,
        profileId: payload.profileId,
        folder: "virtual-try-on",
        fileName: payload.clothItemId ? `${payload.clothItemId}-vton.png` : undefined,
      });

      return { imageUrl: storedUrl, provider: PROVIDER_LABEL, metadata: data as Record<string, unknown> };
    }

    const binaryBuffer = Buffer.from(await response.arrayBuffer());
    const storedUrl = await saveBuffer(binaryBuffer, {
      profileId: payload.profileId,
      folder: "virtual-try-on",
      fileName: payload.clothItemId ? `${payload.clothItemId}-vton.png` : undefined,
    });

    return { imageUrl: storedUrl, provider: PROVIDER_LABEL };
  }

  private async generateWithVertex(payload: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    const garment = await loadImageBuffer(payload.garmentImageUrl);
    const model = await loadImageBuffer(payload.modelImageUrl);
    const garmentBase64 = garment.buffer.toString("base64");
    const modelBase64 = model.buffer.toString("base64");

    const endpoint = buildVtonEndpoint();
    const accessToken = await getAccessToken();

    const defaultInstance: Record<string, unknown> = {
      personImage: {
        image: {
          bytesBase64Encoded: modelBase64,
        },
      },
      productImages: [
        {
          image: {
            bytesBase64Encoded: garmentBase64,
          },
        },
      ],
    };

    if (payload.providerHints?.vertexPersonMask) {
      (defaultInstance as Record<string, unknown>).personMask = payload.providerHints.vertexPersonMask;
    }

    const instanceOverrides =
      (payload.providerHints?.vertexInstance as Record<string, unknown> | undefined) ??
      (payload.providerHints?.instance as Record<string, unknown> | undefined);
    const parameterOverrides =
      (payload.providerHints?.vertexParameters as Record<string, unknown> | undefined) ??
      (payload.providerHints?.parameters as Record<string, unknown> | undefined);

    const requestBody = {
      instances: [
        {
          ...defaultInstance,
          ...(instanceOverrides ?? {}),
        },
      ],
      parameters: {
        baseSteps: 20,
        sampleCount: 1,
        ...(parameterOverrides ?? {}),
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error("Vertex VTON error", response.status, errorPayload);
      throw new Error(`Vertex VTON responded with status ${response.status}`);
    }

    const raw = await response.json();
    const predictions = Array.isArray(raw.predictions) ? raw.predictions : [];
    const firstPrediction = predictions[0] ?? {};

    const base64Image =
      firstPrediction?.generatedImage?.imageBytes ??
      firstPrediction?.image?.imageBytes ??
      firstPrediction?.imageBytes ??
      firstPrediction?.bytesBase64Encoded ??
      (Array.isArray(raw.generatedImages) ? raw.generatedImages[0]?.imageBytes : undefined);

    if (!base64Image) {
      console.error("Vertex VTON did not include imageBytes", raw);
      throw new Error("No imageBytes in Vertex response");
    }

    const buffer = Buffer.from(base64Image, "base64");
    const storedUrl = await saveBuffer(buffer, {
      profileId: payload.profileId,
      folder: "virtual-try-on",
      fileName: payload.clothItemId ? `${payload.clothItemId}-vertex.png` : undefined,
    });

    return { imageUrl: storedUrl, provider: PROVIDER_LABEL, metadata: raw };
  }
}

export const virtualTryOnService = new VirtualTryOnService();
