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

/** 友好日期标签 — "今天", "昨天 · 5月26日", "前天 · 5月25日", 或 "5月24日 周一" */
export function friendlyDateLabel(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return '今天';
  const yesterday = offsetDateStr(-1);
  if (dateStr === yesterday) return `昨天 · ${formatDateShort(dateStr)}`;
  const dayBefore = offsetDateStr(-2);
  if (dateStr === dayBefore) return `前天 · ${formatDateShort(dateStr)}`;
  return formatDateShort(dateStr);
}

/** M月D日 周X */
export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(`${dateStr}T00:00:00`);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${Number(parts[1])}月${Number(parts[2])}日 周${weekDays[d.getDay()]}`;
}

function offsetDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
