'use client';

import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card } from "@/components/ui/card";

export type OutfitItem = {
  id: string;
  clothItemId: string;
  imageUrl: string;
  role: string;
  category: string;
  color: string;
};

export type OutfitCardProps = {
  date: string;
  notes?: string | null;
  weatherSummary?: string | null;
  items: OutfitItem[];
};

const roleLabels: Record<string, string> = {
  TOP: "Üst",
  BOTTOM: "Alt",
  DRESS: "Elbise",
  OUTERWEAR: "Dış giyim",
  SHOES: "Ayakkabı",
  SOCKS: "Çorap",
  ACCESSORY: "Aksesuar",
  OTHER: "Diğer",
};

export const OutfitCard = ({ date, notes, weatherSummary, items }: OutfitCardProps) => {
  const formattedDate = format(new Date(date), "d MMMM yyyy EEEE", { locale: tr });
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Tarih</p>
          <p className="text-lg font-semibold text-slate-800">{formattedDate}</p>
        </div>
        {weatherSummary && (
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            {weatherSummary}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.length === 0 && <p className="text-sm text-slate-500">Henüz parça seçilmedi.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex w-full max-w-[140px] flex-col gap-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={item.imageUrl}
                alt={item.category}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {roleLabels[item.role] ?? item.role}
              </p>
              <p className="text-sm font-medium text-slate-700">{item.category}</p>
              <p className="text-xs text-slate-500">{item.color}</p>
            </div>
          </div>
        ))}
      </div>
      {notes && <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600">{notes}</p>}
    </Card>
  );
};
