'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";

const genderOptions = [
  { label: "Seç", value: "" },
  { label: "Kadın", value: "female" },
  { label: "Erkek", value: "male" },
  { label: "Diğer", value: "other" },
];

const ageRangeOptions = [
  { label: "Seç", value: "" },
  { label: "Çocuk", value: "child" },
  { label: "Genç", value: "teen" },
  { label: "Yetişkin", value: "adult" },
];

type ProfileFormProps = {
  onSuccess?: (profileId: string) => void;
};

type FormState = {
  name: string;
  gender: string;
  ageRange: string;
  locationCity: string;
  stylePreferences: string;
  notes: string;
};

const initialState: FormState = {
  name: "",
  gender: "",
  ageRange: "",
  locationCity: "",
  stylePreferences: "",
  notes: "",
};

export const ProfileForm = ({ onSuccess }: ProfileFormProps) => {
  const [state, setState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          gender: state.gender || undefined,
          ageRange: state.ageRange || undefined,
          locationCity: state.locationCity || undefined,
          stylePreferences: state.stylePreferences
            .split(",")
            .map((item: string) => item.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Profil oluşturulamadı");
      }

      const data = (await response.json()) as { profile: { id: string } };

      setState(initialState);
      router.refresh();
      onSuccess?.(data.profile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label="Profil adı"
        value={state.name}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, name: event.target.value }))
        }
        required
      />
      <Select
        label="Yaş grubu"
        value={state.ageRange}
        options={ageRangeOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setState((prev: FormState) => ({ ...prev, ageRange: event.target.value }))
        }
      />
      <Select
        label="Cinsiyet"
        value={state.gender}
        options={genderOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setState((prev: FormState) => ({ ...prev, gender: event.target.value }))
        }
      />
      <Input
        label="Şehir"
        value={state.locationCity}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, locationCity: event.target.value }))
        }
        placeholder="İstanbul"
      />
      <TextArea
        label="Stil tercihleri"
        value={state.stylePreferences}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          setState((prev: FormState) => ({ ...prev, stylePreferences: event.target.value }))
        }
        placeholder="casual, ofis, spor"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Kaydediliyor" : "Profili oluştur"}
      </Button>
    </form>
  );
};
