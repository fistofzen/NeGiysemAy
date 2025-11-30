import { redirect } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { getActiveProfile } from "@/lib/profiles/active-profile";
import AppShell from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { OutfitVisualizer } from "@/components/outfits/outfit-visualizer";

type OutfitProfileRecord = {
  id: string;
  name: string;
  outfits: Array<{
    id: string;
    date: Date;
    scenario: string;
    notes: string | null;
    weatherSummary: string | null;
    items: Array<{
      id: string;
      role: string;
      clothItem?: {
        category: string;
        color: string;
        imageUrl: string | null;
      } | null;
    }>;
  }>;
};

const OutfitsPage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const activeProfile = await getActiveProfile(session.userId);
  if (!activeProfile) {
    redirect("/profiles/select");
    return null;
  }

  const profile = (await prisma.profile.findUnique({
    where: { id: activeProfile.id },
    include: {
      outfits: {
        include: {
          items: {
            include: {
              clothItem: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  })) as OutfitProfileRecord | null;

  if (!profile) {
    redirect("/profiles/select");
    return null;
  }

  return (
    <AppShell activeProfileName={profile.name}>
      <div className="flex flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Kombinlerim</h1>
          <p className="text-sm text-slate-600">
            {profile.name} profili için geçmiş kombin önerilerini inceleyin.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {profile.outfits.map((outfit) => (
            <Card key={outfit.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <OutfitVisualizer
                  items={outfit.items.map((item) => ({
                    id: item.id,
                    role: item.role,
                    category: item.clothItem?.category,
                    imageUrl: item.clothItem?.imageUrl ?? null,
                    color: item.clothItem?.color ?? null,
                  }))}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {format(outfit.date, "d MMMM yyyy EEEE", { locale: tr })}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      Senaryo: {outfit.scenario.toLowerCase()}
                    </p>
                    {outfit.weatherSummary && (
                      <p className="text-xs text-slate-500">{outfit.weatherSummary}</p>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {outfit.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-700">{item.role.toLowerCase()}</span>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {item.clothItem?.category ?? "-"}
                        </span>
                        <span className="text-xs text-slate-500">{item.clothItem?.color ?? ""}</span>
                      </li>
                    ))}
                  </ul>
                  {outfit.notes && <p className="text-sm text-slate-600">{outfit.notes}</p>}
                </div>
              </div>
            </Card>
          ))}
          {profile.outfits.length === 0 && <Card>Bu profil için henüz kombin önerisi bulunmuyor.</Card>}
        </section>
      </div>
    </AppShell>
  );
};

export default OutfitsPage;
