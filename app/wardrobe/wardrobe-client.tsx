'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WardrobeGrid, type WardrobeItemCard } from "@/components/dashboard/wardrobe-grid";
import { ClothItemForm } from "@/components/forms/cloth-item-form";

const ALL = "ALL";

type FilterOption = {
  label: string;
  value: string;
};

type WardrobeClientProps = {
  profileId: string;
  profileName: string;
  items: Array<WardrobeItemCard & { notes?: string | null; material?: string | null }>;
  categoryOptions: FilterOption[];
  seasonOptions: FilterOption[];
  formalityOptions: FilterOption[];
};

type Filters = {
  category: string;
  season: string;
  formality: string;
  query: string;
};

const initialFilters: Filters = {
  category: ALL,
  season: ALL,
  formality: ALL,
  query: "",
};

export const WardrobeClient = ({
  profileId,
  profileName,
  items,
  categoryOptions,
  seasonOptions,
  formalityOptions,
}: WardrobeClientProps) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  const filteredItems = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = filters.category === ALL || item.category === filters.category;
      const matchesSeason = filters.season === ALL || item.season === filters.season;
      const matchesFormality = filters.formality === ALL || item.formality === filters.formality;
      const matchesQuery =
        query.length === 0 ||
        item.color.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query);

      return matchesCategory && matchesSeason && matchesFormality && matchesQuery;
    });
  }, [filters, items]);

  const totalCount = items.length;
  const filteredCount = filteredItems.length;

  const resetFilters = () => setFilters(initialFilters);

  const handleDelete = async (itemId: string) => {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm("Bu kıyafeti silmek istediğine emin misin?");
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingId(itemId);

    try {
      const response = await fetch(`/api/wardrobe/${itemId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.message ?? "Kıyafet silinemedi";
        throw new Error(message);
      }
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Kıyafet silinemedi");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dolabım</h1>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-semibold">{profileName}</span> · {filteredCount} / {totalCount} parça
          </p>
        </div>
      </header>

      {/* Add Form - Compact */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold text-slate-900">Yeni kıyafet ekle</h2>
          </div>
          <ClothItemForm profileId={profileId} compact />
        </div>
      </Card>

      {/* Filters & Content */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Card className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Filtreler</h2>
              <Button type="button" variant="subtle" onClick={resetFilters}>
                Sıfırla
              </Button>
            </div>
            <Select
              label="Kategori"
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              options={[{ label: "Tümü", value: ALL }, ...categoryOptions]}
            />
            <Select
              label="Sezon"
              value={filters.season}
              onChange={(event) => setFilters((prev) => ({ ...prev, season: event.target.value }))}
              options={[{ label: "Tümü", value: ALL }, ...seasonOptions]}
            />
            <Select
              label="Formalite"
              value={filters.formality}
              onChange={(event) => setFilters((prev) => ({ ...prev, formality: event.target.value }))}
              options={[{ label: "Tümü", value: ALL }, ...formalityOptions]}
            />
            <Input
              label="Ara"
              value={filters.query}
              placeholder="Renk, materyal veya not ara"
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
          </Card>
        </aside>

        <section className="space-y-4">
          {actionError && <p className="text-sm text-red-500">{actionError}</p>}
          <WardrobeGrid items={filteredItems} onDelete={handleDelete} deletingId={deletingId} />
        </section>
      </div>
    </div>
  );
};
