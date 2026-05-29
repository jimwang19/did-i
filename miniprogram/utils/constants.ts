// ============================================================
// 过门不忘 — 预设常量
// 对齐产品规格书 F3: 预设模板 (锁车/服药) + F3 图标
// ============================================================

/** 默认事项模板 — 首次使用时自动创建 */
export const DEFAULT_ITEMS = [
  { id: 'default_bike', name: '锁车', icon: '🚲', sortOrder: 0, createdAt: '' },
  { id: 'default_med', name: '服药', icon: '💊', sortOrder: 1, createdAt: '' },
] as const;

/** 预设图标库 (emoji) */
export const ICON_PRESETS = [
  '🔒', '🚪', '🔥', '🚲', '🐱', '💊', '🏃', '💧',
  '🔌', '📦', '📱', '📖', '🧹', '🍳', '🐶', '🌿',
] as const;

/** 事项名称最大字符数 */
export const ITEM_NAME_MAX = 10;

/** 免费版事项上限 */
export const ITEM_MAX_COUNT = 10;

/** 照片保留天数 (超过此天数的照片自动清理) */
export const PHOTO_KEEP_DAYS = 7;

/** 存储 Key */
export const STORAGE_KEYS = {
  ITEMS: 'memo_items',
  CONFIRMATIONS: 'memo_confirmations',
  SETTINGS: 'memo_settings',
} as const;
