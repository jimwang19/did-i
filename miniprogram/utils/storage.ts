/**
 * 本地存储封装
 * 对齐产品规格书 F5: 本地优先策略
 * 所有读写通过本文件统一入口
 */

import { STORAGE_KEYS, PHOTO_KEEP_DAYS } from './constants';
import type { AppData, AppSettings, Item, Confirmation } from '../types';

// ==================== 通用 JSON 存储 ====================

/** 读取 JSON，失败或不存在返回默认值 */
export function get<T>(key: string, fallback: T): T {
  try {
    const raw = wx.getStorageSync(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 写入 JSON 序列化，捕获 QuotaExceededError */
export function set(key: string, value: unknown): boolean {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('[Storage] write failed:', key, e);
    return false;
  }
}

// ==================== 业务读写 ====================

/** 默认应用数据 */
const DEFAULT_DATA: AppData = {
  items: [],
  confirmations: [],
  settings: { hasSeenOnboarding: false, lastOpenDate: '' },
};

export function loadAppData(): AppData {
  return {
    items: get(STORAGE_KEYS.ITEMS, DEFAULT_DATA.items),
    confirmations: get(STORAGE_KEYS.CONFIRMATIONS, DEFAULT_DATA.confirmations),
    settings: get(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings),
  };
}

export function saveAppData(data: AppData): void {
  set(STORAGE_KEYS.ITEMS, data.items);
  set(STORAGE_KEYS.CONFIRMATIONS, data.confirmations);
  set(STORAGE_KEYS.SETTINGS, data.settings);
}

export function saveItems(items: Item[]): void {
  set(STORAGE_KEYS.ITEMS, items);
}

export function saveConfirmations(confirmations: Confirmation[]): void {
  set(STORAGE_KEYS.CONFIRMATIONS, confirmations);
}

export function saveSettings(settings: AppSettings): void {
  set(STORAGE_KEYS.SETTINGS, settings);
}

// ==================== 照片存储 ====================

/** 保存临时照片到本地文件系统，返回持久化路径 */
export function savePhoto(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.saveFile({
      tempFilePath,
      success: (res) => resolve(res.savedFilePath),
      fail: reject,
    });
  });
}

/** 清理超过 N 天的照片 */
export async function cleanupPhotos(keepDays: number = PHOTO_KEEP_DAYS): Promise<void> {
  try {
    const res = await new Promise<WechatMiniprogram.GetSavedFileListSuccessCallbackResult>(
      (resolve, reject) => wx.getSavedFileList({ success: resolve, fail: reject })
    );
    const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
    for (const file of res.fileList) {
      if (file.createTime * 1000 < cutoff) {
        wx.removeSavedFile({ filePath: file.filePath });
      }
    }
  } catch {
    // 无照片或读取失败，静默处理
  }
}
