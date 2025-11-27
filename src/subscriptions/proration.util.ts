export interface ProrationCalculation {
  fullYearPrice: number;
  daysInYear: number;
  daysRemaining: number;
  proratedPrice: number;
  startDate: Date;
  nextRenewalDate: Date;
}

export function getFirstTuesdayOfYear(year: number): Date {
  const janFirst = new Date(year, 0, 1);
  const dayOfWeek = janFirst.getDay();
  const daysUntilTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;
  const firstTuesday = new Date(year, 0, 1 + daysUntilTuesday);
  firstTuesday.setHours(0, 0, 0, 0);
  return firstTuesday;
}

export function getNextRenewalDate(currentDate: Date = new Date()): Date {
  const nextYear = currentDate.getFullYear() + 1;
  return getFirstTuesdayOfYear(nextYear);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function getDaysRemainingInYear(startDate: Date = new Date()): number {
  const renewalDate = getNextRenewalDate(startDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = renewalDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / msPerDay);
}

export function calculateProration(
  fullYearPrice: number = 0.99,
  startDate: Date = new Date(),
): ProrationCalculation {
  const year = startDate.getFullYear();
  const daysInYear = getDaysInYear(year);
  const daysRemaining = getDaysRemainingInYear(startDate);
  const nextRenewalDate = getNextRenewalDate(startDate);

  const dailyRate = fullYearPrice / daysInYear;
  const proratedPrice = Math.round(dailyRate * daysRemaining * 100) / 100;

  return {
    fullYearPrice,
    daysInYear,
    daysRemaining,
    proratedPrice,
    startDate,
    nextRenewalDate,
  };
}
