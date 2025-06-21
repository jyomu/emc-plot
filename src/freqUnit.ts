export const freqUnitOptions = [
  { label: 'GHz', value: 1e9 },
  { label: 'MHz', value: 1e6 },
  { label: 'kHz', value: 1e3 },
  { label: 'Hz', value: 1 },
] as const;

export function getFreqMultiplier(unit: string): number {
  const opt = freqUnitOptions.find(u => u.label.toUpperCase() === unit.toUpperCase())
  return opt ? opt.value : 1;
}
