import { z } from "zod";

const toDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date");
  }
  return parsed;
};

export const generateOutfitSchema = z.object({
  profileId: z.string().cuid(),
  startDate: z.string().transform(toDate),
  endDate: z.string().optional().transform((value) => (value ? toDate(value) : undefined)),
  scenario: z.string().min(1),
});
