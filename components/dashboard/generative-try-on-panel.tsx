'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEventHandler, type FormEventHandler } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import type { OutfitItem } from "@/components/dashboard/outfit-card";

type GenerativeTryOnPanelProps = {
  profileId: string;
  items: OutfitItem[];
};

const uploadModelPhoto = async (file: File, profileId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("profileId", profileId);

  const response = await fetch("/api/uploads/model", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Model fotoğrafı yüklenemedi");
  }

  const data = (await response.json()) as { url: string; absoluteUrl?: string };
  return data.absoluteUrl ?? data.url;
};

const requestGenerativeTryOn = async (
  params: {
    profileId: string;
    clothItemId?: string;
    modelImageUrl: string;
    garmentPrompt?: string;
  }
) => {
  const response = await fetch("/api/virtual-try-on", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? "Generatif try-on isteği başarısız");
  }

  return (await response.json()) as { imageUrl: string; prompt: string };
};

export const GenerativeTryOnPanel = ({ profileId, items }: GenerativeTryOnPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClothItemId, setSelectedClothItemId] = useState<string>(items[0]?.clothItemId ?? "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultPrompt, setResultPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    return items.map((item) => ({
      value: item.clothItemId,
      label: `${item.category} (${item.role.toLowerCase()})`,
    }));
  }, [items]);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setModelPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return previewUrl;
      });
    } else {
      setModelPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (modelPreview) {
        URL.revokeObjectURL(modelPreview);
      }
    };
  }, [modelPreview]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setResultUrl(null);
    setResultPrompt(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Lütfen bir referans fotoğraf seçin");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrl = await uploadModelPhoto(file, profileId);
      const payload = await requestGenerativeTryOn({
        profileId,
        clothItemId: selectedClothItemId || undefined,
        modelImageUrl: uploadedUrl,
        garmentPrompt: customPrompt || undefined,
      });
      setResultUrl(payload.imageUrl);
      setResultPrompt(payload.prompt);
    } catch (submissionError) {
      console.error(submissionError);
      setError((submissionError as Error).message ?? "İstek başarısız oldu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">AI konsept render</p>
          <p className="text-sm text-slate-600">Referans fotoğrafı yükleyip gpt-image-1 ile hızlı ön izleme al.</p>
        </div>
        <Button variant="subtle" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? "Formu gizle" : "AI görsel oluştur"}
        </Button>
      </div>

      {isOpen && (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {options.length > 1 && (
            <Select
              label="Kıyafet parçası"
              value={selectedClothItemId}
              onChange={(event) => setSelectedClothItemId(event.target.value)}
              options={options}
            />
          )}

          <Input
            ref={fileInputRef}
            label="Model fotoğrafı"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <TextArea
            label="Ek stil notu (opsiyonel)"
            placeholder="Örn: 'kırmızı halı konsepti, pastel arka plan'"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
          />

          {modelPreview && (
            <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-xl border border-slate-200">
              <Image src={modelPreview} alt="Model önizleme" fill className="object-cover" />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Oluşturuluyor..." : "Render al"}
            </Button>
            <Button
              type="button"
              variant="subtle"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setResultUrl(null);
                setResultPrompt(null);
              }}
            >
              İptal
            </Button>
          </div>
        </form>
      )}

      {resultUrl && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sonuç</p>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200">
            <Image src={resultUrl} alt="AI giydirme" fill className="object-cover" />
          </div>
          {resultPrompt && (
            <p className="text-xs text-slate-500">Model prompt: {resultPrompt}</p>
          )}
          <a
            href={resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Görseli yeni sekmede aç
          </a>
        </div>
      )}
    </div>
  );
};
