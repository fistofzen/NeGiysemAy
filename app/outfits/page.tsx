import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";

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

  const profiles = (await prisma.profile.findMany({
    where: { userId: session.userId },
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
  })) as OutfitProfileRecord[];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Kombinlerim</h1>
        <p className="text-sm text-slate-600">
          Geçmiş kombin önerilerinizi inceleyin ve gerekirse yeni teklif alın.
        </p>
        <Link href="/dashboard" className="text-sm font-semibold text-brand-500">
          Kombin önerisi al →
        </Link>
      </header>

      {profiles.map((profile: OutfitProfileRecord) => (
        <section key={profile.id} className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">{profile.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {profile.outfits.map((outfit: OutfitProfileRecord["outfits"][number]) => (
              <Card key={outfit.id} className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {format(outfit.date, "d MMMM yyyy EEEE", { locale: tr })}
                  </p>
                  <p className="text-sm font-medium text-slate-800">Senaryo: {outfit.scenario.toLowerCase()}</p>
                  {outfit.weatherSummary && (
                    <p className="text-xs text-slate-500">{outfit.weatherSummary}</p>
                  )}
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {outfit.items.map((item: OutfitProfileRecord["outfits"][number]["items"][number]) => (
                    <li key={item.id}>
                      {item.role.toLowerCase()} — {item.clothItem?.category?.toLowerCase()} / {item.clothItem?.color}
                    </li>
                  ))}
                </ul>
                {outfit.notes && <p className="text-sm text-slate-600">{outfit.notes}</p>}
              </Card>
            ))}
            {profile.outfits.length === 0 && (
              <Card>Bu profil için henüz kombin önerisi bulunmuyor.</Card>
            )}
          </div>
        </section>
      ))}

      {profiles.length === 0 && <Card>Henüz profil oluşturmadınız.</Card>}
    </main>
  );
};

export default OutfitsPage;
