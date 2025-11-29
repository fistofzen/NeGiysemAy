'use client';

import { Input } from "@/components/ui/input";

export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate?: string;
  onChange: (range: { startDate: string; endDate?: string }) => void;
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        type="date"
        label="Başlangıç tarihi"
        value={startDate}
        onChange={(event) => onChange({ startDate: event.target.value, endDate })}
      />
      <Input
        type="date"
        label="Bitiş tarihi"
        value={endDate ?? ""}
        onChange={(event) =>
          onChange({ startDate, endDate: event.target.value ? event.target.value : undefined })
        }
      />
    </div>
  );
};
