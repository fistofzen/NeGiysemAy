'use client';

import { Select } from "@/components/ui/select";

const scenarioOptions = [
  { label: "Günlük", value: "daily" },
  { label: "Ofis", value: "office" },
  { label: "Seyahat", value: "travel" },
  { label: "Özel gün", value: "special" },
];

type ScenarioSelectorProps = {
  value: string;
  onChange: (scenario: string) => void;
};

export const ScenarioSelector = ({ value, onChange }: ScenarioSelectorProps) => (
  <Select label="Senaryo" value={value} options={scenarioOptions} onChange={(event) => onChange(event.target.value)} />
);
