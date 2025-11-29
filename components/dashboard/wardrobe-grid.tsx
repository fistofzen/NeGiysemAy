'use client';

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type WardrobeItemCard = {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  season: string;
  formality: string;
  material?: string | null;
  notes?: string | null;
};

type WardrobeGridProps = {
  items: WardrobeItemCard[];
  onDelete?: (id: string) => void;
  deletingId?: string | null;
};

const categoryLabels: Record<string, string> = {
  TOP: "Üst",
  BOTTOM: "Alt",
  DRESS: "Elbise",
  OUTERWEAR: "Dış giyim",
  SHOES: "Ayakkabı",
  SOCKS: "Çorap",
  ACCESSORY: "Aksesuar",
};

export const WardrobeGrid = ({ items, onDelete, deletingId }: WardrobeGridProps) => {
  if (items.length === 0) {
    return <Card>Henüz kıyafet eklenmedi.</Card>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="relative flex flex-col gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={item.imageUrl}
              alt={item.category}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            {onDelete && (
              <div className="absolute right-2 top-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 text-red-600 hover:bg-white"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item.id)}
                >
                  {deletingId === item.id ? "Siliniyor" : "Sil"}
                </Button>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {categoryLabels[item.category] ?? item.category}
            </p>
            <p className="text-xs text-slate-500">{item.color}</p>
            {item.material && <p className="text-xs text-slate-500">{item.material}</p>}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{item.season.toLowerCase()}</span>
            <span>{item.formality.toLowerCase()}</span>
          </div>
          {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
        </Card>
      ))}
    </div>
  );
};
