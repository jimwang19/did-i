import { get, saveItems, saveConfirmations } from '../../utils/storage';
import { ITEM_MAX_COUNT } from '../../utils/constants';

Page({
  data: {
    items: [],
    editorVisible: false,
    editorItem: null as any,
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const items = get('memo_items', []);
    this.setData({ items });
  },

  onEditItem(e) {
    const { id } = e.currentTarget.dataset;
    const items = get('memo_items', []);
    const item = items.find(i => i.id === id);
    if (!item) return;
    this.setData({ editorVisible: true, editorItem: { ...item } });
  },

  onDeleteItem(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除事项',
      content: '确认删除该事项？',
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
      wx.showToast({ title: `最多 ${ITEM_MAX_COUNT} 个事项`, icon: 'none' });
      return;
    }
    this.setData({ editorVisible: true, editorItem: null });
  },

  onEditorConfirm(e: any) {
    const { name, icon } = e.detail;
    const items = get('memo_items', []);
    const editing = this.data.editorItem;
    if (editing) {
      const item = items.find(i => i.id === editing.id);
      if (item) { item.name = name; item.icon = icon; }
    } else {
      items.push({
        id: `item_${Date.now()}`,
        name,
        icon,
        sortOrder: items.length,
        createdAt: new Date().toISOString(),
      });
    }
    saveItems(items);
    this.setData({ editorVisible: false, editorItem: null });
    this.loadData();
  },

  onEditorClose() {
    this.setData({ editorVisible: false, editorItem: null });
  },

  onClearHistory() {
    wx.showModal({
      title: '清空历史记录',
      content: '将清除所有确认记录，事项列表保留。此操作不可撤销。',
      confirmText: '确认清空',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (!res.confirm) return;
        saveConfirmations([]);
        wx.showToast({ title: '已清空', icon: 'success' });
      },
    });
  },
});
