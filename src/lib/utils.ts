import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind-friendly className merge helper used by shadcn/ElevenLabs UI components.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
