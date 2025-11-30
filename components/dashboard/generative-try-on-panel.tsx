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

type ModelPhoto = {
  id: string;
  url: string;
  isTemplate: boolean;
};

const fetchModelPhotos = async (profileId: string): Promise<ModelPhoto[]> => {
  const response = await fetch(`/api/profiles/${profileId}/models`);
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as { models: ModelPhoto[] };
  return data.models;
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
    clothItemIds?: string[]; // Tüm kombin parçaları
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
    throw new Error(errorPayload?.message ?? "Virtual try-on isteği başarısız");
  }

  return (await response.json()) as { imageUrl: string; prompt?: string };
};

export const GenerativeTryOnPanel = ({ profileId, items }: GenerativeTryOnPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [useFullOutfit, setUseFullOutfit] = useState(true); // Tüm kombini kullan
  const [selectedClothItemId, setSelectedClothItemId] = useState<string>(items[0]?.clothItemId ?? "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | null>(null);
  const [modelPhotos, setModelPhotos] = useState<ModelPhoto[]>([]);
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

  useEffect(() => {
    if (isOpen && modelPhotos.length === 0) {
      fetchModelPhotos(profileId).then(setModelPhotos).catch(console.error);
    }
  }, [isOpen, profileId, modelPhotos.length]);

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

    // Check if user selected a pre-existing model or uploaded a new one
    let modelImageUrl = selectedModelUrl;
    
    if (!modelImageUrl) {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError("Lütfen bir hazır model seçin veya fotoğraf yükleyin");
        return;
      }

      setIsSubmitting(true);
      try {
        modelImageUrl = await uploadModelPhoto(file, profileId);
      } catch (uploadError) {
        console.error(uploadError);
        setError("Model fotoğrafı yüklenemedi");
        setIsSubmitting(false);
        return;
      }
    } else {
      setIsSubmitting(true);
    }

    try {
      // Tüm kombin parçalarını gönder
      const allClothItemIds = items.map(item => item.clothItemId);
      
      const payload = await requestGenerativeTryOn({
        profileId,
        clothItemIds: useFullOutfit ? allClothItemIds : undefined,
        clothItemId: !useFullOutfit ? selectedClothItemId || undefined : undefined,
        modelImageUrl,
        garmentPrompt: customPrompt || undefined,
      });
      setResultUrl(payload.imageUrl);
      setResultPrompt(payload.prompt ?? null);
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
          <p className="text-xs uppercase tracking-wide text-slate-500">AI Virtual Try-On</p>
          <p className="text-sm text-slate-600">
            Google Vertex AI ile gerçekçi kombin görseli (ardışık giydirme)
          </p>
        </div>
        <Button variant="subtle" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? "Formu gizle" : "AI görsel oluştur"}
        </Button>
      </div>

      {isOpen && (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useFullOutfit}
                onChange={(e) => setUseFullOutfit(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Tüm kombini ardışık giydir ({items.length} parça)
              </span>
            </label>
            <p className="text-xs text-slate-500">
              {useFullOutfit 
                ? `Her kıyafet sırayla giydirilecek (${items.length} adımda). Her adımın sonucu bir sonraki için model olacak.` 
                : "Sadece seçilen bir parça Google Vertex AI ile gerçekçi şekilde giydirilecek"}
            </p>
          </div>

          {!useFullOutfit && options.length > 1 && (
            <Select
              label="Kıyafet parçası"
              value={selectedClothItemId}
              onChange={(event) => setSelectedClothItemId(event.target.value)}
              options={options}
            />
          )}

          {modelPhotos.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Hazır model seç</label>
              <div className="grid grid-cols-4 gap-2">
                {modelPhotos.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModelUrl(model.url);
                      setModelPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition ${
                      selectedModelUrl === model.url
                        ? "border-brand-500 ring-2 ring-brand-300"
                        : "border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    <Image
                      src={model.url}
                      alt={model.isTemplate ? "Hazır model" : "Özel model"}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              label="Veya yeni model fotoğrafı yükle"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e);
                setSelectedModelUrl(null);
              }}
            />
          </div>

          <TextArea
            label="Ek stil notu (opsiyonel)"
            placeholder="Örn: 'kırmızı halı konsepti, pastel arka plan'"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
          />

          {(modelPreview || selectedModelUrl) && (
            <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={modelPreview || selectedModelUrl || ""}
                alt="Model önizleme"
                fill
                className="object-cover"
              />
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
