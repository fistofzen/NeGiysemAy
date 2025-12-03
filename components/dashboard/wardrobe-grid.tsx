'use client';

import { useState } from "react";
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
  const [selectedItem, setSelectedItem] = useState<WardrobeItemCard | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
        Henüz kıyafet eklenmedi
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 transition-all hover:ring-2 hover:ring-slate-900"
          >
            <Image
              src={item.imageUrl}
              alt={item.category}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="150px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2 transition-transform group-hover:translate-y-0">
              <p className="text-xs font-medium text-white">
                {categoryLabels[item.category] ?? item.category}
              </p>
            </div>
          </button>
        ))}
      </div>
      {items.length > 6 && (
        <button className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
          Tümünü Gör ({items.length})
        </button>
      )}

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.category}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {categoryLabels[selectedItem.category] ?? selectedItem.category}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedItem.color}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Sezon</p>
                    <p className="mt-1 text-sm text-slate-900">{selectedItem.season}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Formalite</p>
                    <p className="mt-1 text-sm text-slate-900">{selectedItem.formality}</p>
                  </div>
                  {selectedItem.material && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-slate-500">Materyal</p>
                      <p className="mt-1 text-sm text-slate-900">{selectedItem.material}</p>
                    </div>
                  )}
                </div>
                {selectedItem.notes && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Notlar</p>
                    <p className="mt-1 text-sm text-slate-900">{selectedItem.notes}</p>
                  </div>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    disabled={deletingId === selectedItem.id}
                    className="mt-auto border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {deletingId === selectedItem.id ? "Siliniyor..." : "Sil"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
