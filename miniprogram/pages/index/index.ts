import type { Item, Confirmation } from '../../types';
import { get, saveItems, saveConfirmations, savePhoto, saveSettings } from '../../utils/storage';
import { todayStr, timeStr, timeShort } from '../../utils/date';
import { DEFAULT_ITEMS as DEFAULT_ITEM_TEMPLATES, ITEM_MAX_COUNT } from '../../utils/constants';

Page({
  data: {
    items: [] as Item[],
    today: todayStr(),
    selectedItemId: '' as string,
    showActionSheet: false,
    confirmText: '请选择要确认的事项',
    confirmDisabled: true,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  /** 加载事项列表 */
  loadData() {
    const items = get<Item[]>('memo_items', []);
    const today = todayStr();
    const confirmations = get<Confirmation[]>('memo_confirmations', []);

    const displayItems = items.map(item => {
      const todayConf = confirmations
        .filter(c => c.itemId === item.id && c.date === today)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const latest = todayConf[0] || null;
      return {
        ...item,
        confirmed: !!latest,
        confirmTime: latest ? latest.timestamp : '',
        confirmMethod: latest ? latest.method : '',
      };
    }).sort((a, b) => {
      // 待确认排上，已确认排下
      if (a.confirmed !== b.confirmed) return a.confirmed ? 1 : -1;
      return a.sortOrder - b.sortOrder;
    });

    this.setData({ items: displayItems });
  },

  /** 点击事项卡片 */
  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    const today = todayStr();
    const confirmations = get<Confirmation[]>('memo_confirmations', []);
    const existing = confirmations.find(c => c.itemId === id && c.date === today);

    if (existing) {
      // 已确认的事项，不重复确认
      wx.showToast({ title: '今日已确认', icon: 'none' });
      return;
    }

    this.setData({ selectedItemId: id });
    wx.showActionSheet({
      itemList: ['快速确认', '拍照确认'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.confirmByButton(id);
        } else if (res.tapIndex === 1) {
          this.confirmByCamera(id);
        }
      },
    });
  },

  /** 按钮确认 */
  confirmByButton(itemId: string) {
    const conf: Confirmation = {
      itemId,
      date: todayStr(),
      timestamp: timeStr(),
      method: 'button',
    };
    const confirmations = get<Confirmation[]>('memo_confirmations', []);
    confirmations.push(conf);
    saveConfirmations(confirmations);

    // 更新 settings.lastOpenDate
    const settings = get('memo_settings', { hasSeenOnboarding: false, lastOpenDate: '' });
    settings.lastOpenDate = todayStr();
    saveSettings(settings);

    this.loadData();
    wx.showToast({ title: '已确认', icon: 'success' });
  },

  /** 拍照确认 */
  async confirmByCamera(itemId: string) {
    try {
      const res = await new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>(
        (resolve, reject) => wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['camera'],
          success: resolve,
          fail: reject,
        })
      );
      const tempPath = res.tempFiles[0].tempFilePath;
      const savedPath = await savePhoto(tempPath);

      const conf: Confirmation = {
        itemId,
        date: todayStr(),
        timestamp: timeStr(),
        method: 'camera',
        photoPath: savedPath,
      };
      const confirmations = get<Confirmation[]>('memo_confirmations', []);
      confirmations.push(conf);
      saveConfirmations(confirmations);

      const settings = get('memo_settings', { hasSeenOnboarding: false, lastOpenDate: '' });
      settings.lastOpenDate = todayStr();
      saveSettings(settings);

      this.loadData();
      wx.showToast({ title: '已确认', icon: 'success' });
    } catch {
      // 用户取消拍照
    }
  },

  /** 添加事项 */
  onAddItem() {
    const items = get<Item[]>('memo_items', []);
    if (items.length >= ITEM_MAX_COUNT) {
      wx.showToast({ title: `最多 ${ITEM_MAX_COUNT} 个事项`, icon: 'none' });
      return;
    }

    wx.showModal({
      title: '添加事项',
      editable: true,
      placeholderText: '输入事项名称',
      success: (res) => {
        if (!res.confirm || !res.content?.trim()) return;
        const newItem: Item = {
          id: `item_${Date.now()}`,
          name: res.content.trim().slice(0, 10),
          icon: '📌',
          sortOrder: items.length,
          createdAt: new Date().toISOString(),
        };
        items.push(newItem);
        saveItems(items);
        this.loadData();
      },
    });
  },

  /** 底部快速确认（有待确认事项时可用） */
  onQuickConfirm() {
    const pendingItems = this.data.items.filter((i: any) => !i.confirmed);
    if (pendingItems.length === 0) {
      wx.showToast({ title: '全部已确认', icon: 'none' });
      return;
    }
    // 弹出选择
    const names = pendingItems.map((i: Item) => i.name);
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const item = pendingItems[res.tapIndex];
        this.confirmByButton(item.id);
      },
    });
  },
});
