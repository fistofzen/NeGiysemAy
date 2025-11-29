'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";

export const ProfileCreateCard = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (profileId: string) => {
    setError(null);
    try {
      await fetch("/api/profiles/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
    } catch {
      setError("Profil aktif hale getirilemedi");
    } finally {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <ProfileForm onSuccess={handleSuccess} />
    </div>
  );
};
