import type { AppData, Item, Confirmation } from './types';
import { loadAppData, saveAppData, saveSettings, cleanupPhotos } from './utils/storage';
import { todayStr, isDifferentDay } from './utils/date';
import { DEFAULT_ITEMS as DEFAULT_ITEM_TEMPLATES } from './utils/constants';

App<IAppOption>({
  globalData: {} as AppData,

  onLaunch() {
    this.initAppData();
  },

  onShow() {
    this.checkDailyReset();
  },

  initAppData() {
    const data = loadAppData();
    if (!data.settings.hasSeenOnboarding) {
      const defaults: Item[] = DEFAULT_ITEM_TEMPLATES.map((t, i) => ({
        ...t,
        createdAt: new Date().toISOString(),
      }));
      data.items = defaults;
      data.settings.hasSeenOnboarding = true;
      data.settings.lastOpenDate = todayStr();
      saveAppData(data);
    }
    this.globalData = data;
  },

  checkDailyReset() {
    const data = this.globalData;
    const today = todayStr();
    if (isDifferentDay(data.settings.lastOpenDate, today)) {
      data.settings.lastOpenDate = today;
      saveSettings(data.settings);
      cleanupPhotos();
    }
  },

  getTodayConfirmation(itemId: string): Confirmation | null {
    const today = todayStr();
    return this.globalData.confirmations
      .filter(c => c.itemId === itemId && c.date === today)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0] || null;
  },

  addConfirmation(conf: Confirmation) {
    this.globalData.confirmations.push(conf);
    saveAppData(this.globalData);
  },

  saveItems(items: Item[]) {
    this.globalData.items = items;
    saveAppData(this.globalData);
  },
});

interface IAppOption {
  globalData: AppData;
  initAppData(): void;
  checkDailyReset(): void;
  getTodayConfirmation(itemId: string): Confirmation | null;
  addConfirmation(conf: Confirmation): void;
  saveItems(items: Item[]): void;
}
