export interface EngineOption {
  label: string;
  value: string;
}

export const CUSTOM_ENGINE_VALUE = "__custom__";

export const ENGINE_OPTIONS: EngineOption[] = [
  {
    label: "No preference / engine-agnostic",
    value: ""
  },
  {
    label: "Unreal Engine",
    value: "Unreal Engine"
  },
  {
    label: "Unity",
    value: "Unity"
  },
  {
    label: "Three.js",
    value: "Three.js"
  },
  {
    label: "Godot",
    value: "Godot"
  },
  {
    label: "Custom",
    value: CUSTOM_ENGINE_VALUE
  }
];

export const isKnownEngineValue = (value: string): boolean =>
  ENGINE_OPTIONS.some(
    (option) => option.value !== CUSTOM_ENGINE_VALUE && option.value === value
  );

export const getEngineSelectValue = (value: string): string =>
  isKnownEngineValue(value) || value === "" ? value : CUSTOM_ENGINE_VALUE;
