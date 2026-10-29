import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea kilometraje con separador de miles determinista
 * Evita errores de hidratacion (Hydration Error) entre servidor y cliente movil
 * Ej: 12000 -> "12.000"
 */
export function formatKilometraje(km: number | null | undefined): string {
  if (km == null || isNaN(km)) return "";
  return Math.round(km)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formatea montos en Bolivares (Bs.) con 2 decimales y separadores deterministas
 * Ej: 1234.5 -> "1.234,50"
 */
export function formatBolivares(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "0,00";
  const fixed = Number(val).toFixed(2);
  const [enteros, decimales] = fixed.split(".");
  const conPuntos = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos},${decimales}`;
}

/**
 * Formatea fechas tecnicas de forma determinista para garantizar
 * paridad exacta entre SSR en Node y navegadores moviles
 * Ej: "2026-10-12" -> "12 oct 2026"
 */
export function formatFechaCorta(dateValue: Date | string | null | undefined): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const mes = meses[d.getUTCMonth()];
  const anio = d.getUTCFullYear();
  return `${day} ${mes} ${anio}`;
}

