import type { RestaurantOperatingHour } from "@/lib/generated/prisma/client";

export const DAY_NAMES = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export type OperatingHourInput = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type OperatingStatus = {
  isOpen: boolean;
  isClosedDay: boolean;
  openTime: string | null;
  closeTime: string | null;
  dayOfWeek: number;
  dayName: string;
};

function getIndonesiaDayOfWeek(date: Date): number {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(date);

  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return map[day];
}

function getIndonesiaTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function getOperatingStatus(
  operatingHours: RestaurantOperatingHour[],
  date: Date = new Date(),
): OperatingStatus {
  const dayOfWeek = getIndonesiaDayOfWeek(date);

  const hour = operatingHours.find(
    (item) => item.dayOfWeek === dayOfWeek,
  );

  const dayName = DAY_NAMES[dayOfWeek - 1];

  if (!hour || hour.isClosed) {
    return {
      isOpen: false,
      isClosedDay: true,
      openTime: hour?.openTime ?? null,
      closeTime: hour?.closeTime ?? null,
      dayOfWeek,
      dayName,
    };
  }

  const currentTime = getIndonesiaTime(date);

  const isOpen =
    currentTime >= hour.openTime &&
    currentTime < hour.closeTime;

  return {
    isOpen,
    isClosedDay: false,
    openTime: hour.openTime,
    closeTime: hour.closeTime,
    dayOfWeek,
    dayName,
  };
}

export function isWithinOperatingHours(
  operatingHours: RestaurantOperatingHour[],
  date: Date,
): boolean {
  const status = getOperatingStatus(operatingHours, date);

  return status.isOpen;
}

export function validateOperatingHours(
  operatingHours: OperatingHourInput[],
): string | null {
  if (operatingHours.length !== 7) {
    return "Jam operasional harus memiliki data untuk 7 hari.";
  }

  const days = new Set<number>();

  for (const hour of operatingHours) {
    if (
      !Number.isInteger(hour.dayOfWeek) ||
      hour.dayOfWeek < 1 ||
      hour.dayOfWeek > 7
    ) {
      return "Hari operasional tidak valid.";
    }

    if (days.has(hour.dayOfWeek)) {
      return "Tidak boleh ada hari yang sama lebih dari satu.";
    }

    days.add(hour.dayOfWeek);

    if (hour.isClosed) {
      continue;
    }

    if (!/^\d{2}:\d{2}$/.test(hour.openTime)) {
      return `Format jam buka ${DAY_NAMES[hour.dayOfWeek - 1]} tidak valid.`;
    }

    if (!/^\d{2}:\d{2}$/.test(hour.closeTime)) {
      return `Format jam tutup ${DAY_NAMES[hour.dayOfWeek - 1]} tidak valid.`;
    }

    if (hour.openTime >= hour.closeTime) {
      return `Jam buka ${DAY_NAMES[hour.dayOfWeek - 1]} harus lebih awal dari jam tutup.`;
    }
  }

  return null;
}