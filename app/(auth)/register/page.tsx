import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

const RegisterPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Ne Giysem Ay&apos;a katıl</h1>
          <p className="text-sm text-slate-500">Stil profillerini oluştur, kombin önerilerini keşfet.</p>
        </div>
        <AuthForm mode="register" />
        <p className="text-center text-xs text-slate-500">
          Zaten üyeyim? {" "}
          <Link href="/login" className="font-semibold text-brand-500">
            Giriş yap
          </Link>
        </p>
      </Card>
    </main>
  );
};

export default RegisterPage;
