'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import { formatISO, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { ProfileSelector } from "@/components/dashboard/profile-selector";
import { ScenarioSelector } from "@/components/dashboard/scenario-selector";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { OutfitCard } from "@/components/dashboard/outfit-card";
import { WardrobeGrid } from "@/components/dashboard/wardrobe-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type DashboardProfile = {
  id: string;
  name: string;
  wardrobe: Array<{
    id: string;
    imageUrl: string;
    category: string;
    color: string;
    season: string;
    formality: string;
  }>;
  outfits: Array<{
    id: string;
    date: string;
    scenario: string;
    notes: string | null;
    weatherSummary: string | null;
    items: Array<{
      id: string;
      clothItemId: string;
      role: string;
      category: string;
      color: string;
      imageUrl: string;
    }>;
  }>;
};

type DashboardClientProps = {
  initialProfiles: DashboardProfile[];
  initialDate: string;
  activeProfileId?: string;
};

type DateRangeState = {
  startDate: string;
  endDate?: string;
};

const DashboardClient = ({ initialProfiles, initialDate, activeProfileId }: DashboardClientProps) => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(
    activeProfileId ?? initialProfiles[0]?.id
  );
  const [scenario, setScenario] = useState("daily");
  const [dateRange, setDateRange] = useState<DateRangeState>({ startDate: initialDate });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwitchingProfile, startSwitchTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  useEffect(() => {
    if (activeProfileId) {
      setSelectedProfileId(activeProfileId);
    }
  }, [activeProfileId]);

  const selectedProfile = useMemo(
    () => profiles.find((profile: DashboardProfile) => profile.id === selectedProfileId) ?? profiles[0],
    [profiles, selectedProfileId]
  );

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    startSwitchTransition(async () => {
      try {
        await fetch("/api/profiles/active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });
      } catch (error) {
        console.error("Profil değiştirilemedi", error);
      } finally {
        router.refresh();
      }
    });
  };

  const todayKey = formatISO(new Date(), { representation: "date" });

  const todayOutfit = useMemo(() => {
    return selectedProfile?.outfits.find((outfit: DashboardProfile["outfits"][number]) => outfit.date === todayKey);
  }, [selectedProfile, todayKey]);

  const handleGenerate = async () => {
    if (!selectedProfile) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfile.id,
          scenario,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Öneri alınamadı");
      }

      const data = (await response.json()) as {
        outfits: DashboardProfile["outfits"];
      };

      setProfiles((prev: DashboardProfile[]) =>
        prev.map((profile: DashboardProfile) =>
          profile.id === selectedProfile.id
            ? {
                ...profile,
                outfits: mergeOutfits(profile.outfits, data.outfits),
              }
            : profile
        )
      );
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const outfitsSorted = useMemo(() => {
    if (!selectedProfile) {
      return [];
    }
    return [...selectedProfile.outfits].sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [selectedProfile]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-widest text-brand-500">Ne Giysem Ay</p>
        <h1 className="text-3xl font-semibold text-slate-900">Hoş geldin, bugün ne giyiyoruz?</h1>
        <p className="text-sm text-slate-600">
          Profil seç, tarih aralığını belirle ve senaryoya göre yapay zekadan kombin iste.
        </p>
      </header>

      <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <ProfileSelector
          profiles={profiles.map((profile: DashboardProfile) => ({ id: profile.id, name: profile.name }))}
          selectedProfileId={selectedProfile?.id}
          onChange={handleProfileChange}
          disabled={isSwitchingProfile}
        />
        <ScenarioSelector value={scenario} onChange={setScenario} />
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
        <div className="flex items-end">
          <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !selectedProfile || isSwitchingProfile}>
            {isGenerating ? "Öneriler hazırlanıyor" : "Kombin öner"}
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Bugünün kombini</p>
              <p className="text-lg font-semibold text-slate-800">
                {new Intl.DateTimeFormat("tr-TR", {
                  dateStyle: "long",
                }).format(parseISO(todayKey))}
              </p>
            </div>
            <Button variant="subtle" onClick={handleGenerate} disabled={isGenerating || !selectedProfile}>
              Yeniden öner
            </Button>
          </div>
          {todayOutfit ? (
            <OutfitCard
              date={todayOutfit.date}
              notes={todayOutfit.notes}
              weatherSummary={todayOutfit.weatherSummary}
              items={todayOutfit.items}
            />
          ) : (
            <p className="text-sm text-slate-500">
              Bugün için henüz kombin oluşturulmadı. Hemen bir öneri iste.
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Dolabım</p>
          </div>
          <WardrobeGrid items={selectedProfile?.wardrobe ?? []} />
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Kombin geçmişi</h2>
          <span className="text-xs text-slate-500">
            {selectedProfile?.outfits.length ?? 0} kayıt
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {outfitsSorted.map((outfit) => (
            <OutfitCard key={outfit.id} {...outfit} />
          ))}
        </div>
      </section>
    </div>
  );
};

const mergeOutfits = (
  existing: DashboardProfile["outfits"],
  incoming: DashboardProfile["outfits"]
): DashboardProfile["outfits"] => {
  const map = new Map<string, DashboardProfile["outfits"][number]>();
  existing.forEach((outfit) => map.set(`${outfit.date}-${outfit.scenario}`, outfit));
  incoming.forEach((outfit) => map.set(`${outfit.date}-${outfit.scenario}`, outfit));
  return Array.from(map.values());
};

export default DashboardClient;
