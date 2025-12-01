import Link from "next/link";
import { Sparkles, Shirt, Clock, Check, Star, Users, Zap, Shield } from "lucide-react";
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider";

const LandingPage = () => {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shirt className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-slate-900">Ne Giysem Ay</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Giriş
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              <Zap className="h-4 w-4" />
              <span>500+ Kullanıcı Bu Hafta Katıldı</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Her Sabah 15 Dakika<br />
              <span className="text-brand-600">Dolap Önünde Harcamayın</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
              <strong>&quot;Ne giysem?&quot;</strong> stresinden kurtulun. AI ile 30 saniyede mükemmel kombinler.
            </p>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Check className="h-5 w-5 text-green-600" />
                <span>Kredi kartı gerektirmez</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-5 w-5 text-green-600" />
                <span>3 dakikada kurulum</span>
              </div>
            </div>
            
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-10 py-5 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:bg-brand-700"
            >
              <span>Şimdi Ücretsiz Başla</span>
              <Sparkles className="h-6 w-6" />
            </Link>
            <p className="mt-3 text-sm text-slate-500">30 gün para iade garantisi</p>
          </div>
        </div>
      </section>

      {/* Problem-Solution */}
      <section className="border-y border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-block rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">❌ Eski Yöntem</div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Sabah 15-20 dakika dolap önünde zaman kaybı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Giydiğiniz kombin beğenmeyip tekrar değiştirme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Dolabınızda ne olduğunu hatırlayamama</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Hava durumuna uygun kıyafet seçememe</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="mb-4 inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">✓ Ne Giysem Ay ile</div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span><strong>30 saniyede</strong> AI destekli kombin önerisi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span><strong>Sanal deneme</strong> ile beğenmeden giymeyeceksiniz</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span><strong>Dijital dolap</strong> ile her şey elinizin altında</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span><strong>Hava durumu entegrasyonu</strong> ile her zaman hazır</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* VTON Showcase */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-semibold text-brand-700">
              🚀 En Güçlü Özellik
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Google AI ile Gerçek Sanal Deneme
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Kıyafetleri giymeden önce üzerinizde görün
            </p>
          </div>
          
          <div className="mx-auto max-w-2xl">
            <ImageComparisonSlider
              beforeImage="/templates/models/model1.png"
              afterImage="/templates/models/model2.png"
              beforeLabel="Orijinal"
              afterLabel="AI Try-On"
              className="aspect-[3/4] rounded-2xl shadow-2xl"
            />
            <div className="mt-6 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                <span>Bunu Şimdi Denemek İstiyorum</span>
                <Sparkles className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            3 Basit Adımda Başlayın
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <span className="text-2xl font-bold text-brand-600">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Fotoğraf Yükleyin</h3>
              <p className="text-slate-600">Kendinizin ve dolabınızdaki kıyafetlerin fotoğraflarını yükleyin</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <span className="text-2xl font-bold text-brand-600">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Kombin Seçin</h3>
              <p className="text-slate-600">AI size özel kombinler önerir</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <span className="text-2xl font-bold text-brand-600">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Sanal Olarak Deneyin</h3>
              <p className="text-slate-600">Seçtiğiniz kıyafetleri üzerinizde görün</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Kullanıcılarımız Ne Diyor?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-6 shadow-sm">
              <div className="mb-3 flex gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="mb-4 text-slate-700">&quot;Her sabah çocukları hazırlarken dolap önünde 20 dakika kaybediyordum. Şimdi 2 dakikada çıkıyorum!&quot;</p>
              <div>
                <p className="font-semibold text-slate-900">Ayşe K.</p>
                <p className="text-sm text-slate-500">Çalışan Anne</p>
              </div>
            </div>
            
            <div className="rounded-xl bg-slate-50 p-6 shadow-sm">
              <div className="mb-3 flex gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="mb-4 text-slate-700">&quot;Müşteri ziyaretleri öncesi kombini ne kadar önemli. AI öneriler sayesinde her zaman hazırım.&quot;</p>
              <div>
                <p className="font-semibold text-slate-900">Mehmet B.</p>
                <p className="text-sm text-slate-500">Satış Müdürü</p>
              </div>
            </div>
            
            <div className="rounded-xl bg-slate-50 p-6 shadow-sm">
              <div className="mb-3 flex gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="mb-4 text-slate-700">&quot;Dolabımda ne olduğunu bile unutuyordum. Artık tüm kıyafetlerim elimin altında!&quot;</p>
              <div>
                <p className="font-semibold text-slate-900">Zeynep A.</p>
                <p className="text-sm text-slate-500">Üniversite Öğrencisi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <div className="mb-1 text-4xl font-bold">2,500+</div>
              <p className="text-brand-100">Aktif Kullanıcı</p>
            </div>
            <div className="text-center">
              <Clock className="mx-auto mb-2 h-8 w-8" />
              <div className="mb-1 text-4xl font-bold">15dk</div>
              <p className="text-brand-100">Günlük Zaman Tasarrufu</p>
            </div>
            <div className="text-center">
              <Zap className="mx-auto mb-2 h-8 w-8" />
              <div className="mb-1 text-4xl font-bold">50K+</div>
              <p className="text-brand-100">Oluşturulan Kombin</p>
            </div>
            <div className="text-center">
              <Star className="mx-auto mb-2 h-8 w-8" />
              <div className="mb-1 text-4xl font-bold">4.9/5</div>
              <p className="text-brand-100">Kullanıcı Memnuniyeti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <Shield className="mb-2 h-10 w-10 text-brand-600" />
              <p className="text-sm font-semibold text-slate-900">Güvenli Ödeme</p>
              <p className="text-xs text-slate-600">SSL Korumalı</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Check className="mb-2 h-10 w-10 text-brand-600" />
              <p className="text-sm font-semibold text-slate-900">30 Gün Garanti</p>
              <p className="text-xs text-slate-600">Para İade</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 h-10 w-10 text-brand-600" />
              <p className="text-sm font-semibold text-slate-900">Canlı Destek</p>
              <p className="text-xs text-slate-600">7/24 Yardım</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="mb-2 h-10 w-10 text-brand-600" />
              <p className="text-sm font-semibold text-slate-900">Anında Başla</p>
              <p className="text-xs text-slate-600">3 Dk Kurulum</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Clock className="h-4 w-4" />
            <span>Bu Hafta Kaydolan İlk 100 Kişiye Özel Bonus</span>
          </div>
          <h2 className="text-3xl font-bold sm:text-5xl">
            Her Sabahınızı<br />Daha Kolay Yapın
          </h2>
          <p className="mt-6 text-xl text-brand-100">
            15 dakika kaybetmeyin. 30 saniyede hazırlanın.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-white px-12 py-5 text-lg font-bold text-brand-600 shadow-xl transition hover:scale-105"
            >
              Şimdi Ücretsiz Başla →
            </Link>
            <p className="text-sm text-brand-100">✓ Kredi kartı gerektirmez  ✓ 30 gün para iade  ✓ 3 dakikada hazır</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Ne Giysem Ay</span>
            </div>
            <p className="text-sm text-slate-600">© 2025 Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
