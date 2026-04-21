import type { JsonbinRegionCode } from "@/lib/regions";

export type RegionFocus = {
  scale: number;
  x: number;
  y: number;
};

export const REGION_FOCUS: Record<JsonbinRegionCode, RegionFocus> = {
  Africa: { scale: 3.5, x: 59, y: 80 },
  "East Asia": { scale: 4, x: 92, y: 56 },
  Europe: { scale: 1.95, x: 50, y: 22 },
  LAC: { scale: 2.1, x: 12, y: 100 },
  NAMESTAN: { scale: 2.75, x: 66, y: 59 },
  NAmOceania: { scale: 0.9, x: 22, y: 57 },
  SESA: { scale: 3.95, x: 89, y: 70 },
};
