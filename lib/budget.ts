export function getCurrentBudgetPeriod(
  paydayDay: number,
  now: Date = new Date()
): { year: number; month: number } {
  const day = now.getDate();
  if (day >= paydayDay) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return { year: prevYear, month: prevMonth };
}

export function getBudgetDateRange(
  paydayDay: number,
  year: number,
  month: number
): { startDate: string; endDate: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const startDate = `${year}-${pad(month)}-${pad(paydayDay)}`;

  let endYear: number;
  let endMonth: number;
  if (month === 12) {
    endYear = year + 1;
    endMonth = 1;
  } else {
    endYear = year;
    endMonth = month + 1;
  }

  let endDay: number;
  if (paydayDay === 1) {
    endDay = new Date(endYear, endMonth, 0).getDate();
  } else {
    endDay = paydayDay - 1;
  }

  const endDate = `${endYear}-${pad(endMonth)}-${pad(endDay)}`;
  return { startDate, endDate };
}

export function getPeriodLabel(
  paydayDay: number,
  year: number,
  month: number
): string {
  if (paydayDay === 1) {
    return new Date(year, month - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }
  const startLabel = new Date(year, month - 1).toLocaleString("default", {
    month: "short",
  });
  let endYear = year;
  let endMonth = month + 1;
  if (endMonth > 12) {
    endMonth = 1;
    endYear = year + 1;
  }
  const endLabel = new Date(endYear, endMonth - 1).toLocaleString("default", {
    month: "short",
  });
  return `${startLabel} ${paydayDay} – ${endLabel} ${paydayDay - 1}`;
}

export function getDaysInBudgetPeriod(
  paydayDay: number,
  year: number,
  month: number
): number {
  if (paydayDay === 1) {
    return new Date(year, month, 0).getDate();
  }
  const { startDate, endDate } = getBudgetDateRange(paydayDay, year, month);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
