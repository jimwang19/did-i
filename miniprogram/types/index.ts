// ============================================================
// 过门不忘 — TypeScript 类型定义
// 对齐产品规格书 F2/F3/F5 + 架构方案 docs/04-plan/mvp-architecture-plan.md
// ============================================================

/** 确认事项 — 对应产品规格书 F3 */
export interface Item {
  /** 唯一 ID (日期时间戳) */
  id: string;
  /** 事项名称 (如"锁车")，最多 10 字符 */
  name: string;
  /** 图标标识 (emoji 或预设图标 key) */
  icon: string;
  /** 排序权重，数值越小越靠前 */
  sortOrder: number;
  /** 创建时间 ISO 8601 */
  createdAt: string;
}

/** 确认记录 — 对应产品规格书 F2 */
export interface Confirmation {
  /** 关联事项 ID */
  itemId: string;
  /** 确认日期 YYYY-MM-DD */
  date: string;
  /** 确认时间 HH:mm:ss */
  timestamp: string;
  /** 确认方式 */
  method: 'button' | 'camera';
  /** 照片本地路径 (仅拍照确认时有) */
  photoPath?: string;
}

/** 全局设置 */
export interface AppSettings {
  /** 是否已完成首次引导 */
  hasSeenOnboarding: boolean;
  /** 上次打开日期 YYYY-MM-DD (用于每日重置判断) */
  lastOpenDate: string;
}

/** 完整应用数据 — 对应产品规格书 F5 */
export interface AppData {
  items: Item[];
  confirmations: Confirmation[];
  settings: AppSettings;
}
