'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import { formatISO } from "date-fns";
import { useRouter } from "next/navigation";
import { ProfileSelector } from "@/components/dashboard/profile-selector";
import { ScenarioSelector } from "@/components/dashboard/scenario-selector";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { OutfitCard } from "@/components/dashboard/outfit-card";
import { WardrobeGrid } from "@/components/dashboard/wardrobe-grid";
import { Button } from "@/components/ui/button";

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

  const handleDeleteOutfit = (outfitId: string) => {
    setProfiles((prev: DashboardProfile[]) =>
      prev.map((profile: DashboardProfile) =>
        profile.id === selectedProfile?.id
          ? {
              ...profile,
              outfits: profile.outfits.filter((outfit) => outfit.id !== outfitId),
            }
          : profile
      )
    );
    router.refresh();
  };

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {selectedProfile?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Intl.DateTimeFormat("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
          <Button 
            className="hidden sm:flex" 
            onClick={handleGenerate} 
            disabled={isGenerating || !selectedProfile || isSwitchingProfile}
          >
            {isGenerating ? "Oluşturuluyor..." : "Kombin Öner"}
          </Button>
        </header>

        {/* Controls */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Button 
                className="w-full sm:hidden" 
                onClick={handleGenerate} 
                disabled={isGenerating || !selectedProfile || isSwitchingProfile}
              >
                {isGenerating ? "Hazırlanıyor..." : "Öner"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Outfit */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900">Bugünün Kombini</h2>
                  <Button 
                    variant="subtle" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !selectedProfile}
                    className="text-sm"
                  >
                    Yenile
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {todayOutfit ? (
                  <OutfitCard
                    id={todayOutfit.id}
                    date={todayOutfit.date}
                    notes={todayOutfit.notes}
                    weatherSummary={todayOutfit.weatherSummary}
                    items={todayOutfit.items}
                    profileId={selectedProfile?.id}
                    enableGenerative
                    onDelete={() => handleDeleteOutfit(todayOutfit.id)}
                  />
                ) : (
                  <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-slate-100 p-6">
                      <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Henüz kombin yok</h3>
                    <p className="mt-2 text-sm text-slate-500">Yukarıdaki ayarları yapıp kombin oluşturun</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Stats */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-medium text-slate-900">İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Toplam Kombin</span>
                  <span className="text-lg font-semibold text-slate-900">{selectedProfile?.outfits.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Dolaptaki Parça</span>
                  <span className="text-lg font-semibold text-slate-900">{selectedProfile?.wardrobe.length ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Wardrobe Preview */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-medium text-slate-900">Dolabım</h3>
              <WardrobeGrid items={selectedProfile?.wardrobe ?? []} />
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-900">Geçmiş Kombinler</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {selectedProfile?.outfits.length ?? 0}
            </span>
          </div>
          <div className="p-6">
            {outfitsSorted.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {outfitsSorted.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    id={outfit.id}
                    date={outfit.date}
                    notes={outfit.notes}
                    weatherSummary={outfit.weatherSummary}
                    items={outfit.items}
                    profileId={selectedProfile?.id}
                    enableGenerative
                    onDelete={() => handleDeleteOutfit(outfit.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900">Henüz geçmiş yok</p>
                <p className="mt-1 text-sm text-slate-500">İlk kombinini oluştur</p>
              </div>
            )}
          </div>
        </div>
      </div>
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
