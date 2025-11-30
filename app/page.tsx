import Link from "next/link";
import { Sparkles, Shirt, Users, Calendar, Cloud, Camera } from "lucide-react";

const LandingPage = () => {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shirt className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Ne Giysem Ay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              <span>Yapay Zeka Destekli Moda Asistanı</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Dolabınızı Akıllı Hale
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent"> Getirin</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Her sabah &ldquo;ne giysem?&rdquo; sorusuna yapay zeka ile anında cevap bulun. Hava durumu, takvim ve kişisel tarzınıza göre mükemmel kombinler oluşturun.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
              >
                <span>Hemen Başla</span>
                <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
              </Link>
              <Link
                href="#ozellikler"
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Nasıl Çalışır?
              </Link>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative -m-2 rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="aspect-[16/9] overflow-hidden rounded-md bg-gradient-to-br from-brand-100 to-purple-100 shadow-2xl ring-1 ring-slate-900/10">
                {/* Placeholder for app screenshot */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Shirt className="mx-auto h-24 w-24 text-brand-300" />
                    <p className="mt-4 text-sm font-medium text-slate-500">App Önizleme</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600">Özellikler</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Gardırobunuz için her şey bir arada
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Kıyafetlerinizi yönetin, kombinler oluşturun ve sanal deneme ile nasıl göründüğünü görün.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: "Sanal Deneme",
                  description:
                    "Google Vertex AI ile kıyafetlerinizi sanal olarak üzerinizde deneyin. Gerçek görüntünüzle kombinlerin nasıl göründüğünü görün.",
                  icon: Camera,
                },
                {
                  name: "Hava Durumu Entegrasyonu",
                  description:
                    "Günlük hava koşullarına göre otomatik kombin önerileri alın. Sıcak, soğuk, yağmurlu - her duruma hazır olun.",
                  icon: Cloud,
                },
                {
                  name: "Akıllı Kombin Önerileri",
                  description:
                    "Yapay zeka takviminizdeki etkinlikleri analiz eder ve uygun kombinler önerir. İş toplantısı, randevu veya spor için.",
                  icon: Calendar,
                },
                {
                  name: "Dijital Dolap",
                  description:
                    "Tüm kıyafetlerinizi kategorize edin, fotoğraflayın ve organize edin. Her parçanın detaylı kaydını tutun.",
                  icon: Shirt,
                },
                {
                  name: "Aile Profilleri",
                  description:
                    "Kendiniz, eşiniz ve çocuklarınız için ayrı profiller oluşturun. Herkes için özel gardırop yönetimi.",
                  icon: Users,
                },
                {
                  name: "AI Stil Asistanı",
                  description:
                    "Kişisel tarzınızı öğrenen yapay zeka, size özel stil önerileri ve kombinasyon fikirleri sunar.",
                  icon: Sparkles,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <feature.icon className="h-5 w-5 flex-none text-brand-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Virtual Try-On Showcase */}
      <section className="bg-gradient-to-br from-slate-50 to-brand-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sanal Deneme ile Kombinlerinizi Görün
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Google&apos;ın en son yapay zeka teknolojisi ile kıyafetlerinizi gerçek fotoğrafınız üzerinde deneyin.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/10">
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm font-medium text-slate-400">Önce</p>
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-medium text-slate-700">Orijinal Fotoğraf</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/10">
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-brand-100 to-purple-100">
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm font-medium text-brand-400">Sonra</p>
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-medium text-slate-700">Sanal Deneme Sonucu</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Bugün başlayın, dolabınızı akıllı hale getirin
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Ücretsiz hesap oluşturun ve yapay zeka destekli gardırop asistanınızı kullanmaya başlayın.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Shirt className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-semibold text-slate-900">Ne Giysem Ay</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              © 2025 Ne Giysem Ay. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
