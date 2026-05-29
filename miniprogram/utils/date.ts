/** 日期工具 — 每日重置判断、今日格式化 */

/** YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** HH:mm:ss */
export function timeStr(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** HH:mm (不带秒，用于 UI 展示) */
export function timeShort(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 比较两个日期字符串是否不同 (YYYY-MM-DD) */
export function isDifferentDay(dateStr: string | null | undefined, today: string): boolean {
  return !dateStr || dateStr !== today;
}
