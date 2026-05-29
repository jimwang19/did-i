import { get, saveItems, saveConfirmations, saveSettings } from '../../utils/storage';
import { todayStr, timeStr } from '../../utils/date';
import { ITEM_MAX_COUNT } from '../../utils/constants';

Page({
  data: {
    displayItems: [],
    todayDisplay: '',
    selectedItemId: '',
    hideConfirmed: false,
    pendingCount: 0,
    statusBarHeight: 0,
  },

  onLoad() {
    try {
      const sysInfo = wx.getWindowInfo();
      this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    } catch {
      this.setData({ statusBarHeight: 44 });
    }
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  _buildDisplayItems() {
    const items = get('memo_items', []);
    const today = todayStr();
    const confirmations = get('memo_confirmations', []);

    return items.map(item => {
      const todayConf = confirmations
        .filter(c => c.itemId === item.id && c.date === today)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const latest = todayConf[0] || null;
      return {
        ...item,
        confirmed: !!latest,
        confirmTimeShort: latest ? latest.timestamp.slice(0, 5) : '',
        confirmMethod: latest ? latest.method : '',
      };
    }).sort((a, b) => {
      if (a.confirmed !== b.confirmed) return a.confirmed ? 1 : -1;
      return a.sortOrder - b.sortOrder;
    });
  },

  loadData() {
    const displayItems = this._buildDisplayItems();
    const pendingCount = displayItems.filter(i => !i.confirmed).length;
    const filtered = this.data.hideConfirmed
      ? displayItems.filter(i => !i.confirmed)
      : displayItems;

    const d = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const todayDisplay = `${d.getMonth() + 1}月${d.getDate()}日 周${weekDays[d.getDay()]}`;

    this.setData({ displayItems: filtered, todayDisplay, pendingCount });
  },

  toggleFilter() {
    const hideConfirmed = !this.data.hideConfirmed;
    const displayItems = this._buildDisplayItems();
    const filtered = hideConfirmed
      ? displayItems.filter(i => !i.confirmed)
      : displayItems;

    this.setData({ hideConfirmed, displayItems: filtered });
  },

  onItemTap(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.displayItems.find(i => i.id === id);
    if (!item) return;

    if (item.confirmed) {
      wx.showToast({ title: '今日已确认', icon: 'none' });
      return;
    }

    this.setData({ selectedItemId: this.data.selectedItemId === id ? '' : id });
  },

  onCheckTap(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.displayItems.find(i => i.id === id);
    if (!item) return;

    if (item.confirmed) {
      wx.showToast({ title: '今日已确认', icon: 'none' });
      return;
    }

    this.confirmByButton(id);
  },

  onAddItem() {
    const items = get('memo_items', []);
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
        const newItem = {
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

  onPhotoConfirm() {
    if (!this.data.selectedItemId) {
      wx.showToast({ title: '请先选择事项', icon: 'none' });
      return;
    }
    this.confirmByCamera(this.data.selectedItemId);
  },

  onQuickConfirm() {
    if (!this.data.selectedItemId) {
      wx.showToast({ title: '请先选择事项', icon: 'none' });
      return;
    }
    this.confirmByButton(this.data.selectedItemId);
  },

  confirmByButton(itemId) {
    this._saveConfirmation(itemId, 'button', '');
  },

  confirmByCamera(itemId) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        const fsm = wx.getFileSystemManager();
        const savedPath = `${wx.env.USER_DATA_PATH}/${Date.now()}.jpg`;
        fsm.saveFile({
          tempFilePath: tempPath,
          filePath: savedPath,
          success: () => {
            this._saveConfirmation(itemId, 'camera', savedPath);
          },
          fail: () => {
            wx.showToast({ title: '照片保存失败，请重试', icon: 'none' });
          },
        });
      },
    });
  },

  _saveConfirmation(itemId, method, photoPath) {
    const conf = {
      itemId,
      date: todayStr(),
      timestamp: timeStr(),
      method,
      photoPath: method === 'camera' ? photoPath : '',
    };
    const confirmations = get('memo_confirmations', []);
    confirmations.push(conf);
    saveConfirmations(confirmations);

    const settings = get('memo_settings', { hasSeenOnboarding: false, lastOpenDate: '' });
    settings.lastOpenDate = todayStr();
    saveSettings(settings);

    this.setData({ selectedItemId: '' });
    this.loadData();
    wx.showToast({ title: '已确认', icon: 'success' });
  },
});
