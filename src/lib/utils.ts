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

/**
 * Obtiene una fecha futura en formato YYYY-MM-DD en zona horaria de Colombia
 * @param days - Número de días a agregar a la fecha actual
 * @returns String con la fecha futura en formato ISO (YYYY-MM-DD)
 */
export function getFutureDate(days: number): string {
  const today = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  // Agregar los días especificados
  colombiaDate.setDate(colombiaDate.getDate() + days);

  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
  const day = String(colombiaDate.getDate()).padStart(2, '0');

  const dateString = `${year}-${month}-${day}`;
  return dateString;
}

/**
 * Obtiene el mes actual (0-11) en zona horaria de Colombia
 * @returns Número del mes actual (0 = Enero, 11 = Diciembre)
 */
export function getCurrentMonth(): number {
  const today = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return colombiaDate.getMonth();
}

/**
 * Obtiene el timestamp actual en formato ISO string en zona horaria de Colombia
 * @returns String con el timestamp actual en formato ISO
 */
export function getCurrentTimestamp(): string {
  const today = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return colombiaDate.toISOString();
}

/**
 * Formatea una fecha en formato legible español colombiano
 * @param date - Fecha en formato string o Date
 * @returns String con la fecha formateada (ej: "29/07/2025")
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
}

/**
 * Formatea una fecha con hora en formato legible español colombiano
 * @param date - Fecha en formato string o Date
 * @returns String con la fecha y hora formateada (ej: "29/07/2025, 14:30")
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
}

/**
 * Formatea una fecha en formato YYYY-MM-DD
 * @param date - La fecha a formatear
 * @returns String con la fecha en formato ISO (YYYY-MM-DD)
 */
export function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
