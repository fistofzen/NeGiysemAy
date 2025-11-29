import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { getActiveProfile } from "@/lib/profiles/active-profile";
import { Card } from "@/components/ui/card";
import { ProfileSelectClient } from "@/app/profiles/select/profile-select-client";
import { ProfileCreateCard } from "@/app/profiles/select/profile-create-card";

const ProfilesSelectPage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  const activeProfile = await getActiveProfile(session.userId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.35rem] text-brand-500">Ne Giysem Ay</p>
        <h1 className="text-3xl font-semibold text-slate-900">Kimin için kombin hazırlayalım?</h1>
        <p className="text-sm text-slate-600">
          Netflix profilleri tarzında farklı kişiler için dolaplar oluşturun ve uygun profili seçin.
        </p>
      </header>

      <ProfileSelectClient
        profiles={profiles}
        activeProfileId={activeProfile?.id}
      />

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Yeni profil oluştur</h2>
          <p className="text-sm text-slate-500">Aile bireyleriniz veya farklı stil senaryoları için ayrı profiller ekleyin.</p>
        </div>
        <ProfileCreateCard />
      </Card>
    </main>
  );
};

export default ProfilesSelectPage;
