import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda colombiana (COP)
 * @param amount - El monto a formatear
 * @returns String formateado como moneda colombiana
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Formatea un número como moneda colombiana sin el símbolo de peso
 * @param amount - El monto a formatear
 * @returns String formateado como número con separadores de miles colombianos
 */
export function formatNumber(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "0";
  }

  return new Intl.NumberFormat("es-CO").format(numericAmount);
}
