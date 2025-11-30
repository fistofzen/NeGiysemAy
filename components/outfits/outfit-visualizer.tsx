'use client';

import { useMemo, type CSSProperties } from "react";
import Image from "next/image";

export type VisualOutfitItem = {
  id: string;
  role: string;
  category?: string | null;
  imageUrl?: string | null;
  color?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  TOP: "Üst",
  BOTTOM: "Alt",
  DRESS: "Elbise",
  OUTERWEAR: "Dış giyim",
  SHOES: "Ayakkabı",
  ACCESSORY: "Aksesuar",
  SOCKS: "Çorap",
  OTHER: "Diğer",
};

const POSITION_MAP: Record<string, { top: string; width: string; height: string; zIndex?: number }> = {
  DRESS: { top: "22%", width: "68%", height: "58%", zIndex: 3 },
  TOP: { top: "22%", width: "58%", height: "34%", zIndex: 4 },
  OUTERWEAR: { top: "18%", width: "66%", height: "50%", zIndex: 5 },
  BOTTOM: { top: "56%", width: "56%", height: "30%", zIndex: 3 },
  SHOES: { top: "84%", width: "44%", height: "14%", zIndex: 6 },
  SOCKS: { top: "76%", width: "34%", height: "12%", zIndex: 5 },
  ACCESSORY: { top: "10%", width: "32%", height: "14%", zIndex: 6 },
  OTHER: { top: "44%", width: "48%", height: "34%", zIndex: 2 },
};

const defaultPosition = { top: "40%", width: "50%", height: "40%", zIndex: 2 };

const MANNEQUIN_SRC = "/templates/mannequin.png" as const;

const normalizeRole = (role: string): string => role.toUpperCase();

const resolveSwatch = (seed: string | null | undefined): string => {
  if (!seed) {
    return "hsl(210, 30%, 70%)";
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // convert to 32bit
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 68%)`;
};

const computeStyle = (role: string): CSSProperties => {
  const settings = POSITION_MAP[role] ?? defaultPosition;
  return {
    position: "absolute",
    top: settings.top,
    left: "50%",
    width: settings.width,
    height: settings.height,
    transform: "translate(-50%, 0)",
    zIndex: settings.zIndex ?? 2,
  } satisfies CSSProperties;
};

export const OutfitVisualizer = ({ items }: { items: VisualOutfitItem[] }) => {
  const uniqueItems = useMemo(() => {
    const byRole = new Map<string, VisualOutfitItem>();
    for (const item of items) {
      const roleKey = normalizeRole(item.role);
      if (!byRole.has(roleKey)) {
        byRole.set(roleKey, { ...item, role: roleKey });
      }
    }
    return Array.from(byRole.values());
  }, [items]);

  return (
    <div className="relative h-96 w-60">
      <Image
        src={MANNEQUIN_SRC}
        alt="Manken silueti"
        fill
        priority
        className="pointer-events-none select-none object-contain"
        sizes="240px"
      />

      {uniqueItems.map((item) => {
        const style = computeStyle(item.role);
        const label = ROLE_LABELS[item.role] ?? item.role.toLowerCase();
        return (
          <div key={item.id} style={style} className="group">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-lg backdrop-blur">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={label}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white"
                  style={{ background: resolveSwatch(item.color ?? item.category ?? item.role) }}
                >
                  {label}
                </div>
              )}
            </div>
            <span className="mt-2 block text-center text-[11px] font-medium text-slate-600">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
