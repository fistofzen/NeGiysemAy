import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type StorageContext = {
  profileId?: string;
  folder?: string;
};

export type SaveBufferOptions = StorageContext & {
  fileName?: string;
  mimeType?: string;
  extension?: string;
};

export interface StorageProvider {
  save(file: File, context?: StorageContext): Promise<string>;
  remove?(url: string): Promise<void>;
  saveBuffer?(buffer: Buffer, options?: SaveBufferOptions): Promise<string>;
}

class LocalStorageProvider implements StorageProvider {
  async save(file: File, context: StorageContext = {}): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name || "").toLowerCase() || ".jpg";
    const safeExtension = extension.match(/^\.[a-z0-9]+$/i) ? extension : ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${safeExtension}`;

    const segments = resolveFolderSegments(context.profileId, context.folder, "misc");
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", ...segments);

    await fs.mkdir(uploadsRoot, { recursive: true });

    const filePath = path.join(uploadsRoot, fileName);
    await fs.writeFile(filePath, buffer);

    return buildPublicUrl(segments, fileName);
  }

  async saveBuffer(buffer: Buffer, options: SaveBufferOptions = {}): Promise<string> {
    const { profileId, folder, mimeType, extension, fileName } = options;
    const segments = resolveFolderSegments(profileId, folder, "virtual-try-on");
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", ...segments);

    await fs.mkdir(uploadsRoot, { recursive: true });

    const resolvedExtension = resolveExtension({ extension, mimeType, fileName });
    const sanitizedFileName = sanitizeFileName(fileName, resolvedExtension);
    const outputPath = path.join(uploadsRoot, sanitizedFileName);

    await fs.writeFile(outputPath, buffer);

    return buildPublicUrl(segments, sanitizedFileName);
  }

  async remove(url: string): Promise<void> {
    const relativePath = url.replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

const providerCache: Record<string, StorageProvider> = {};

const resolveFolderSegments = (
  profileId?: string,
  folder?: string,
  fallback = "misc"
): string[] => {
  const segments: string[] = [];
  if (profileId) {
    segments.push(profileId);
  }
  if (folder) {
    segments.push(folder);
  }
  if (segments.length === 0) {
    segments.push(fallback);
  }
  return segments;
};

const buildPublicUrl = (segments: string[], fileName: string): string => {
  const normalizedSegments = segments.map((segment) => segment.replace(/\\/g, "/"));
  return `/uploads/${[...normalizedSegments, fileName].join("/")}`;
};

const DEFAULT_EXTENSION = ".png";
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
};

const resolveExtension = ({
  extension,
  mimeType,
  fileName,
}: Pick<SaveBufferOptions, "extension" | "mimeType" | "fileName">): string => {
  if (extension && /^\.[a-z0-9]+$/i.test(extension)) {
    return extension.toLowerCase();
  }

  if (mimeType && EXTENSION_BY_MIME[mimeType]) {
    return EXTENSION_BY_MIME[mimeType];
  }

  if (fileName) {
    const derived = path.extname(fileName);
    if (derived && /^\.[a-z0-9]+$/i.test(derived)) {
      return derived.toLowerCase();
    }
  }

  return DEFAULT_EXTENSION;
};

const sanitizeFileName = (fileName: string | undefined, extension: string): string => {
  if (fileName) {
    const base = path.basename(fileName, path.extname(fileName)).replace(/[^a-z0-9-_]/gi, "-");
    if (base) {
      return `${base}-${Date.now()}${extension}`;
    }
  }
  return `${Date.now()}-${randomUUID()}${extension}`;
};

const getProvider = (): StorageProvider => {
  const driver = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();

  if (!providerCache[driver]) {
    switch (driver) {
      case "local":
      default:
        providerCache[driver] = new LocalStorageProvider();
        break;
    }
  }

  return providerCache[driver];
};

export const saveFile = async (file: File, context?: StorageContext) => {
  const provider = getProvider();
  return provider.save(file, context);
};

export const saveBuffer = async (buffer: Buffer, options?: SaveBufferOptions) => {
  const provider = getProvider();
  if (!provider.saveBuffer) {
    throw new Error("The configured storage driver does not support saving raw buffers");
  }
  return provider.saveBuffer(buffer, options);
};

export const removeFile = async (url: string | null | undefined) => {
  if (!url) {
    return;
  }
  const provider = getProvider();
  if (provider.remove) {
    await provider.remove(url);
  }
};
