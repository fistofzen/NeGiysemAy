import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { WardrobeGrid } from "@/components/dashboard/wardrobe-grid";
import { ClothItemForm } from "@/components/forms/cloth-item-form";

type WardrobeProfileRecord = {
  id: string;
  name: string;
  clothItems: Array<{
    id: string;
    imageUrl: string;
    category: string;
    color: string;
    season: string;
    formality: string;
  }>;
};

const WardrobePage = async () => {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
    return null;
  }

  const profiles = (await prisma.profile.findMany({
    where: { userId: session.userId },
    include: {
      clothItems: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })) as WardrobeProfileRecord[];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Dolabım</h1>
        <p className="text-sm text-slate-600">
          Kıyafetlerini ekle, kategorize et ve kombin önerilerinde kullan.
        </p>
      </header>

      {profiles.map((profile) => (
        <section key={profile.id} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{profile.name}</h2>
            <span className="text-xs text-slate-500">{profile.clothItems.length} parça</span>
          </div>

          <WardrobeGrid items={profile.clothItems} />

          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Yeni kıyafet ekle</h3>
            <p className="mt-1 text-sm text-slate-500">
              Görsel yükleyebilir veya lorem görseliyle simüle edebilirsiniz.
            </p>
            <div className="mt-4">
              <ClothItemForm profileId={profile.id} />
            </div>
          </Card>
        </section>
      ))}

      {profiles.length === 0 && (
        <Card>
          Henüz profiliniz yok. <span className="font-semibold">Profiller</span> sayfasından oluşturduktan sonra
          dolabınıza parçalar ekleyebilirsiniz.
        </Card>
      )}
    </main>
  );
};

export default WardrobePage;
