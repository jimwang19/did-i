import { get, saveItems, saveConfirmations, saveSettings } from '../../utils/storage';
import { todayStr, timeStr } from '../../utils/date';
import { ITEM_MAX_COUNT, STORAGE_KEYS } from '../../utils/constants';

Page({
  data: {
    displayItems: [],
    todayDisplay: '',
    selectedItemId: '',
    selectedItemName: '',
    hideConfirmed: false,
    pendingCount: 0,
    statusBarHeight: 0,
    headerPaddingRight: 20,
    detailVisible: false,
    detailData: null as any,
    editMode: false,
    editorVisible: false,
  },

  onLoad() {
    try {
      const sysInfo = wx.getWindowInfo();
      this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    } catch {
      this.setData({ statusBarHeight: 44 });
    }
    try {
      const capsule = wx.getMenuButtonBoundingClientRect();
      const windowWidth = wx.getWindowInfo().windowWidth;
      this.setData({ headerPaddingRight: windowWidth - capsule.left + 8 });
    } catch {
      this.setData({ headerPaddingRight: 100 });
    }
    const settings = get(STORAGE_KEYS.SETTINGS, { hasSeenOnboarding: false, lastOpenDate: '' });
    if (!settings.hasSeenOnboarding) {
      wx.navigateTo({ url: '/pages/onboarding/onboarding' });
      return;
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
    const orderedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const totalByName = {};
    const serialById = {};

    orderedItems.forEach(item => {
      totalByName[item.name] = (totalByName[item.name] || 0) + 1;
    });

    const currentByName = {};
    orderedItems.forEach(item => {
      currentByName[item.name] = (currentByName[item.name] || 0) + 1;
      serialById[item.id] = currentByName[item.name];
    });

    return items.map(item => {
      const todayConf = confirmations
        .filter(c => c.itemId === item.id && c.date === today)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const latest = todayConf[0] || null;
      const serialNo = serialById[item.id] || 1;
      const showSerialBadge = (totalByName[item.name] || 0) > 1;
      const displayName = showSerialBadge ? `${item.name} #${serialNo}` : item.name;
      return {
        ...item,
        serialNo,
        showSerialBadge,
        displayName,
        confirmed: !!latest,
        confirmTimeShort: latest ? latest.timestamp.slice(0, 5) : '',
        confirmMethod: latest ? latest.method : '',
        confirmDate: latest ? latest.date : '',
        confirmPhotoPath: latest ? (latest.photoPath || '') : '',
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
    const selected = displayItems.find(i => i.id === this.data.selectedItemId);

    this.setData({
      displayItems: filtered,
      todayDisplay,
      pendingCount,
      selectedItemId: selected ? this.data.selectedItemId : '',
      selectedItemName: selected ? selected.displayName : '',
    });
  },

  toggleFilter() {
    const hideConfirmed = !this.data.hideConfirmed;
    const displayItems = this._buildDisplayItems();
    const filtered = hideConfirmed
      ? displayItems.filter(i => !i.confirmed)
      : displayItems;
    const selected = displayItems.find(i => i.id === this.data.selectedItemId);

    this.setData({
      hideConfirmed,
      displayItems: filtered,
      selectedItemId: selected ? this.data.selectedItemId : '',
      selectedItemName: selected ? selected.displayName : '',
    });
  },

  onItemTap(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.displayItems.find(i => i.id === id);
    if (!item) return;

    if (item.confirmed) {
      this.setData({
        detailVisible: true,
        detailData: {
          icon: item.icon,
          name: item.name,
          date: item.confirmDate,
          time: item.confirmTimeShort,
          method: item.confirmMethod,
          photoPath: item.confirmPhotoPath,
        },
      });
      return;
    }

    const isSame = this.data.selectedItemId === id;
    this.setData({
      selectedItemId: isSame ? '' : id,
      selectedItemName: isSame ? '' : (item.displayName || item.name || ''),
    });
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

  onDetailClose() {
    this.setData({ detailVisible: false });
  },

  onToggleEditMode() {
    this.setData({ editMode: !this.data.editMode, selectedItemId: '', selectedItemName: '' });
  },

  onDeleteItem(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.displayItems.find(i => i.id === id);
    wx.showModal({
      title: '删除事项',
      content: `确认删除“${item?.displayName || item?.name || ''}”？历史记录保留。`,
      success: (res) => {
        if (!res.confirm) return;
        const items = get('memo_items', []).filter(i => i.id !== id);
        saveItems(items);
        this.loadData();
      },
    });
  },

  onAddItem() {
    const items = get('memo_items', []);
    if (items.length >= ITEM_MAX_COUNT) {
      wx.showToast({ title: `免费版最多 ${ITEM_MAX_COUNT} 个事项`, icon: 'none' });
      return;
    }
    this.setData({ editorVisible: true });
  },

  onEditorConfirm(e: any) {
    const { name, icon } = e.detail;
    const items = get('memo_items', []);
    if (items.length >= ITEM_MAX_COUNT) {
      wx.showToast({ title: `免费版最多 ${ITEM_MAX_COUNT} 个事项`, icon: 'none' });
      this.setData({ editorVisible: false });
      return;
    }
    items.push({
      id: `item_${Date.now()}`,
      name: name.slice(0, 10),
      icon,
      sortOrder: items.length,
      createdAt: new Date().toISOString(),
    });
    saveItems(items);
    this.setData({ editorVisible: false });
    this.loadData();
  },

  onEditorClose() {
    this.setData({ editorVisible: false });
  },

  onAddEntry(e) {
    // 点击事项行右侧 + 按鈕，新增同类型待确认槽位（方案b: 复制 item）
    const { name, icon } = e.currentTarget.dataset;
    const items = get('memo_items', []);
    if (items.length >= ITEM_MAX_COUNT) {
      wx.showToast({ title: `免费版最多 ${ITEM_MAX_COUNT} 个事项`, icon: 'none' });
      return;
    }
    // 计算同名事项已有多少个（仅用于 sortOrder，序号由 loadData 中 showSerialBadge 逻辑处理）
    items.push({
      id: `item_${Date.now()}`,
      name,
      icon,
      sortOrder: items.length,
      createdAt: new Date().toISOString(),
    });
    saveItems(items);
    this.loadData();
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

    this.setData({ selectedItemId: '', selectedItemName: '' });
    this.loadData();
    wx.showToast({ title: '已确认', icon: 'success' });
  },
});
