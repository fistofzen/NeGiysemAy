import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(1).max(80),
  ageRange: z.string().max(40).optional(),
  gender: z.string().max(40).optional(),
  locationCity: z.string().max(80).optional(),
  stylePreferences: z.array(z.string().min(1)).optional().default([]),
});

export const updateProfileSchema = createProfileSchema.partial();
