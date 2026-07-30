function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, new Date(year, month, 0).getDate());
}

export function getCurrentBudgetPeriod(
  paydayDay: number,
  now: Date = new Date()
): { year: number; month: number } {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const effectiveDay = clampDay(year, month, paydayDay);

  if (now.getDate() >= effectiveDay) {
    return { year, month };
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return { year: prevYear, month: prevMonth };
}

export function getBudgetDateRange(
  paydayDay: number,
  year: number,
  month: number
): { startDate: string; endDate: string } {
  const pad = (n: number) => String(n).padStart(2, "0");

  const startDay = clampDay(year, month, paydayDay);
  const start = new Date(year, month - 1, startDay);
  const end = new Date(start.getTime() + 29 * 24 * 60 * 60 * 1000);

  const startDate = `${year}-${pad(month)}-${pad(startDay)}`;
  const endDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

  return { startDate, endDate };
}

export function getPeriodLabel(
  paydayDay: number,
  year: number,
  month: number
): string {
  const { startDate, endDate } = getBudgetDateRange(paydayDay, year, month);
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startLabel = start.toLocaleString("default", { month: "short" });
  const endLabel = end.toLocaleString("default", { month: "short" });

  return `${startLabel} ${start.getDate()} – ${endLabel} ${end.getDate()}`;
}

export function getDaysInBudgetPeriod(
  _paydayDay: number,
  _year: number,
  _month: number
): number {
  return 30;
}
