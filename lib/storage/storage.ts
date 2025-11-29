import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type StorageContext = {
  profileId?: string;
  folder?: string;
};

export interface StorageProvider {
  save(file: File, context?: StorageContext): Promise<string>;
  remove?(url: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  async save(file: File, context: StorageContext = {}): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name || "").toLowerCase() || ".jpg";
    const safeExtension = extension.match(/^\.[a-z0-9]+$/i) ? extension : ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${safeExtension}`;
    const subFolder = context.profileId ?? context.folder ?? "misc";
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", subFolder);

    await fs.mkdir(uploadsRoot, { recursive: true });

    const filePath = path.join(uploadsRoot, fileName);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${subFolder}/${fileName}`;
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

export const removeFile = async (url: string | null | undefined) => {
  if (!url) {
    return;
  }
  const provider = getProvider();
  if (provider.remove) {
    await provider.remove(url);
  }
};
