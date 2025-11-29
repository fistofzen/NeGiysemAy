'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";

const categoryOptions = [
  { label: "Üst", value: "TOP" },
  { label: "Alt", value: "BOTTOM" },
  { label: "Elbise", value: "DRESS" },
  { label: "Dış giyim", value: "OUTERWEAR" },
  { label: "Ayakkabı", value: "SHOES" },
  { label: "Çorap", value: "SOCKS" },
  { label: "Aksesuar", value: "ACCESSORY" },
];

const seasonOptions = [
  { label: "İlkbahar", value: "SPRING" },
  { label: "Yaz", value: "SUMMER" },
  { label: "Sonbahar", value: "AUTUMN" },
  { label: "Kış", value: "WINTER" },
  { label: "Dört mevsim", value: "ALL_SEASONS" },
];

const formalityOptions = [
  { label: "Günlük", value: "CASUAL" },
  { label: "Ofis", value: "OFFICE" },
  { label: "Spor", value: "SPORT" },
  { label: "Özel gün", value: "SPECIAL" },
];

type ClothItemFormProps = {
  profileId: string;
  onSuccess?: () => void;
};

type FormState = {
  category: string;
  color: string;
  material: string;
  season: string;
  formality: string;
  notes: string;
};

const initialState: FormState = {
  category: "TOP",
  color: "",
  material: "",
  season: "ALL_SEASONS",
  formality: "CASUAL",
  notes: "",
};

export const ClothItemForm = ({ profileId, onSuccess }: ClothItemFormProps) => {
  const [state, setState] = useState<FormState>(initialState);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profileId", profileId);
      formData.append("category", state.category);
      formData.append("color", state.color);
      formData.append("season", state.season);
      formData.append("formality", state.formality);
      if (state.material) {
        formData.append("material", state.material);
      }
      if (state.notes) {
        formData.append("notes", state.notes);
      }
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/wardrobe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Kıyafet eklenemedi");
      }

      setState(initialState);
      setFile(null);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Select
        label="Kategori"
        value={state.category}
        options={categoryOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setState((prev: FormState) => ({ ...prev, category: event.target.value }))
        }
        required
      />
      <Input
        label="Renk"
        value={state.color}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, color: event.target.value }))
        }
        required
      />
      <Input
        label="Materyal"
        value={state.material}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setState((prev: FormState) => ({ ...prev, material: event.target.value }))
        }
      />
      <Select
        label="Sezon"
        value={state.season}
        options={seasonOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setState((prev: FormState) => ({ ...prev, season: event.target.value }))
        }
        required
      />
      <Select
        label="Formalite"
        value={state.formality}
        options={formalityOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setState((prev: FormState) => ({ ...prev, formality: event.target.value }))
        }
        required
      />
      <TextArea
        label="Notlar"
        value={state.notes}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          setState((prev: FormState) => ({ ...prev, notes: event.target.value }))
        }
      />
      <Input
        type="file"
        label="Görsel"
        accept="image/*"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const selectedFile = event.target.files?.item(0) ?? null;
          setFile(selectedFile);
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Kaydediliyor" : "Kıyafet ekle"}
      </Button>
    </form>
  );
};
