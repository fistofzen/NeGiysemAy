import { eachDayOfInterval, formatISO } from "date-fns";

export const determineDateRange = (startDate: Date, endDate?: Date): Date[] => {
  if (!endDate) {
    return [startDate];
  }

  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const formatDateKey = (date: Date): string => formatISO(date, { representation: "date" });
