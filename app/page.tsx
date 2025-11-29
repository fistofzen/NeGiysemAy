import Link from "next/link";

const LandingPage = () => {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-2xl font-semibold tracking-tight">Ne Giysem Ay</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Giriş yap
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-400"
          >
            Kayıt ol
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-widest text-white/60">
          Gardırobunuz yapay zeka ile buluşuyor
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Dolabınızdaki parçaları hava durumuna ve takviminize göre akıllıca kombinleyin.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          Ne Giysem Ay, aile bireyleriniz için ayrı profiller oluşturmanıza, kıyafet envanterinizi yönetmenize ve her gün için isabetli kombin önerileri almanıza yardımcı olur.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400"
          >
            Ücretsiz denemeye başla
          </Link>
          <Link
            href="#ozellikler"
            className="rounded-lg border border-white/20 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Özellikleri keşfet
          </Link>
        </div>
      </section>

      <section id="ozellikler" className="w-full bg-white py-16 text-slate-900">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-3">
          {[
            {
              title: "Akıllı kombin önerileri",
              description:
                "Hava durumu, tarih ve senaryoyu hesaba katan kişiselleştirilmiş öneriler alın.",
            },
            {
              title: "Aile profilleri",
              description:
                "Kendiniz, çocuklarınız veya eşiniz için ayrı profiller oluşturun ve yönetin.",
            },
            {
              title: "Dolap yönetimi",
              description:
                "Tüm kıyafetlerinizi kategorilere göre düzenleyin, not ekleyin ve hızlıca filtreleyin.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
