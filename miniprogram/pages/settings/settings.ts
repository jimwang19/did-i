import { get, saveItems } from '../../utils/storage';
import { ITEM_MAX_COUNT, ICON_PRESETS } from '../../utils/constants';

Page({
  data: {
    items: [],
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const items = get('memo_items', []);
    this.setData({ items });
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
});
