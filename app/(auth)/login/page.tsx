import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Tekrar hoş geldin!</h1>
          <p className="text-sm text-slate-500">Dolabına erişmek için hesabına giriş yap.</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-center text-xs text-slate-500">
          Hesabın yok mu? {" "}
          <Link href="/register" className="font-semibold text-brand-500">
            Hemen kayıt ol
          </Link>
        </p>
      </Card>
    </main>
  );
};

export default LoginPage;
