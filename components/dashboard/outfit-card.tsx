'use client';

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerativeTryOnPanel } from "@/components/dashboard/generative-try-on-panel";

export type OutfitItem = {
  id: string;
  clothItemId: string;
  imageUrl: string;
  role: string;
  category: string;
  color: string;
};

export type OutfitCardProps = {
  id?: string;
  date: string;
  notes?: string | null;
  weatherSummary?: string | null;
  items: OutfitItem[];
  profileId?: string;
  enableGenerative?: boolean;
  onDelete?: () => void;
};

const roleLabels: Record<string, string> = {
  TOP: "Üst",
  BOTTOM: "Alt",
  DRESS: "Elbise",
  OUTERWEAR: "Dış giyim",
  SHOES: "Ayakkabı",
  SOCKS: "Çorap",
  ACCESSORY: "Aksesuar",
  HAT: "Şapka",
  OTHER: "Diğer",
};

export const OutfitCard = ({
  id,
  date,
  notes,
  weatherSummary,
  items,
  profileId,
  enableGenerative,
  onDelete,
}: OutfitCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const formattedDate = format(new Date(date), "d MMMM yyyy EEEE", { locale: tr });

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm("Bu kombini silmek istediğinize emin misiniz?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/outfits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Kombin silinemedi");
      }

      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tarih</p>
          <p className="text-lg font-semibold text-slate-800">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {weatherSummary && (
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              {weatherSummary}
            </div>
          )}
          {id && (
            <Button
              variant="subtle"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:bg-red-50"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
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
              <p className="text-xs text-slate-500">{item.color}</p>
            </div>
          </div>
        ))}
      </div>
      {notes && <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600">{notes}</p>}
      {enableGenerative && profileId && (
        <GenerativeTryOnPanel profileId={profileId} items={items} />
      )}
    </Card>
  );
};
