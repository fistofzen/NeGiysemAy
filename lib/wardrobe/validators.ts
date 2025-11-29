import { ClothCategory, ClothFormality, ClothSeason } from "@prisma/client";
import { z } from "zod";

export const createClothItemSchema = z.object({
  profileId: z.string().cuid(),
  category: z.nativeEnum(ClothCategory),
  color: z.string().min(1).max(40),
  material: z.string().max(60).optional(),
  season: z.nativeEnum(ClothSeason),
  formality: z.nativeEnum(ClothFormality),
  notes: z.string().max(255).optional(),
});

export type CreateClothItemInput = z.infer<typeof createClothItemSchema>;
