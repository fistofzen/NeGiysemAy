'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
    .trim() || "?";
};

type ProfileCard = {
  id: string;
  name: string;
  customModelPhotos: string[];
};

type ProfileSelectClientProps = {
  profiles: ProfileCard[];
  activeProfileId?: string;
};

export const ProfileSelectClient = ({ profiles, activeProfileId }: ProfileSelectClientProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (profileId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/profiles/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      if (!response.ok) {
        throw new Error("Profil seçilemedi");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil seçilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleSelect(profile.id)}
              className={clsx(
                "flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md",
                isActive && "border-brand-500/70 ring-2 ring-brand-300",
                isSubmitting && "pointer-events-none opacity-70"
              )}
              disabled={isSubmitting}
            >
              {profile.customModelPhotos.length > 0 ? (
                <Image
                  src={profile.customModelPhotos[0]}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-semibold text-brand-600">
                  {getInitials(profile.name)}
                </span>
              )}
              <span className="text-sm font-medium text-slate-800">{profile.name}</span>
              {isActive && <span className="text-xs font-semibold uppercase text-brand-500">Aktif profil</span>}
            </button>
          );
        })}
        {profiles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Henüz profil oluşturmadınız. Aşağıdaki formu kullanın.
          </div>
        )}
      </div>
      {profiles.length > 0 && (
        <Button
          variant="subtle"
          onClick={() => {
            router.push("/profiles");
          }}
          disabled={isSubmitting}
        >
          Profilleri yönet
        </Button>
      )}
    </div>
  );
};
