import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { getActiveProfile } from "@/lib/profiles/active-profile";
import AppShell from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/profile-form";

type ProfileRecord = {
  id: string;
  name: string;
  ageRange: string | null;
  gender: string | null;
  locationCity: string | null;
  stylePreferences: string[];
};

const ProfilesPage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const profiles = (await prisma.profile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  })) as ProfileRecord[];

  const activeProfile = await getActiveProfile(session.userId);

  return (
    <AppShell activeProfileName={activeProfile?.id ? profiles.find((p) => p.id === activeProfile.id)?.name : undefined}>
      <div className="flex flex-col gap-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Stil profillerim</h1>
          <p className="text-sm text-slate-600">
            Aile bireyleriniz için profiller oluşturup kişiselleştirilmiş kombin önerileri alın.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile: ProfileRecord) => (
            <Card key={profile.id} className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
              <p className="text-sm text-slate-500">{profile.locationCity ?? "Konum belirtilmedi"}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {(profile.stylePreferences || []).join(", ") || "Tercih eklenmedi"}
              </p>
            </Card>
          ))}
          {profiles.length === 0 && (
            <Card>Henüz profil oluşturmadınız. Hemen aşağıdaki formu kullanın.</Card>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Yeni profil ekle</h2>
          <p className="mt-1 text-sm text-slate-500">
            Profil bilgileri kombin önerilerinin daha isabetli olmasını sağlar.
          </p>
          <div className="mt-6">
            <ProfileForm />
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default ProfilesPage;
