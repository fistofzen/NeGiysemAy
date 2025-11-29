'use client';

import { Select } from "@/components/ui/select";

type Profile = {
  id: string;
  name: string;
};

type ProfileSelectorProps = {
  profiles: Profile[];
  selectedProfileId?: string;
  onChange: (profileId: string) => void;
  disabled?: boolean;
};

export const ProfileSelector = ({ profiles, selectedProfileId, onChange, disabled }: ProfileSelectorProps) => {
  return (
    <Select
      label="Profil"
      value={selectedProfileId}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      options={profiles.map((profile) => ({ label: profile.name, value: profile.id }))}
    />
  );
};
