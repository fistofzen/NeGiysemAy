'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

type FormState = {
  email: string;
  password: string;
  displayName: string;
};

const initialState: FormState = {
  email: "",
  password: "",
  displayName: "",
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [state, setState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const payload =
        mode === "register"
          ? {
              email: state.email,
              password: state.password,
              displayName: state.displayName,
            }
          : {
              email: state.email,
              password: state.password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "İşlem başarısız oldu");
      }

      router.push("/profiles/select");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {mode === "register" && (
        <Input
          label="Adınız"
          value={state.displayName}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState((prev: FormState) => ({ ...prev, displayName: event.target.value }))
          }
          required
        />
      )}
      <Input
        type="email"
        label="E-posta"
        value={state.email}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, email: event.target.value }))
        }
        required
      />
      <Input
        type="password"
        label="Şifre"
        value={state.password}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, password: event.target.value }))
        }
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Gönderiliyor" : mode === "register" ? "Kayıt ol" : "Giriş yap"}
      </Button>
    </form>
  );
};
