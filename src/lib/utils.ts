import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { WeightUnit } from "@/types/workout"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert weight to a standard unit (kg) for calculations
export function convertToKg(weight: number, unit: WeightUnit): number {
  return unit === 'lbs' ? weight * 0.453592 : weight;
}

// Convert weight from kg to target unit
export function convertFromKg(weight: number, targetUnit: WeightUnit): number {
  return targetUnit === 'lbs' ? weight / 0.453592 : weight;
}
