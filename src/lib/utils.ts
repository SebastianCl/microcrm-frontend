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

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria de Colombia
 * @returns String con la fecha actual en formato ISO (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const today = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
  const day = String(colombiaDate.getDate()).padStart(2, '0');

  const dateString = `${year}-${month}-${day}`;
  return dateString;

}
