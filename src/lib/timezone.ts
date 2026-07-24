export const DEFAULT_APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

function datePartsInTimeZone(date: Date, timeZone = DEFAULT_APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

export function getLocalDateInputValue(date: Date = new Date(), timeZone = DEFAULT_APP_TIMEZONE) {
  const { year, month, day } = datePartsInTimeZone(date, timeZone);
  return `${year}-${month}-${day}`;
}

export function getLocalMonthPeriod(date: Date | string = new Date(), timeZone = DEFAULT_APP_TIMEZONE) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const { year, month } = datePartsInTimeZone(parsed, timeZone);
  return `${year}-${month}`;
}

export function dateInputToUtcIso(dateInput: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return new Date(dateInput).toISOString();
  return new Date(`${dateInput}T00:00:00.000+07:00`).toISOString();
}

export function isoToDateInput(date: string | Date, timeZone = DEFAULT_APP_TIMEZONE) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return getLocalDateInputValue(parsed, timeZone);
}

export function daysUntilLocalDate(date: string | Date, from: Date = new Date()) {
  const targetInput = isoToDateInput(date);
  const fromInput = getLocalDateInputValue(from);
  const targetUtc = Date.UTC(Number(targetInput.slice(0, 4)), Number(targetInput.slice(5, 7)) - 1, Number(targetInput.slice(8, 10)));
  const fromUtc = Date.UTC(Number(fromInput.slice(0, 4)), Number(fromInput.slice(5, 7)) - 1, Number(fromInput.slice(8, 10)));
  return Math.round((targetUtc - fromUtc) / (1000 * 60 * 60 * 24));
}
