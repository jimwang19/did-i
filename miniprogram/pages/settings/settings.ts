import { get, saveItems } from '../../utils/storage';
import { ITEM_MAX_COUNT, ITEM_NAME_MAX } from '../../utils/constants';

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

  onEditItem(e) {
    const { id } = e.currentTarget.dataset;
    const items = get('memo_items', []);
    const item = items.find(i => i.id === id);
    if (!item) return;

    wx.showModal({
      title: '修改名称',
      editable: true,
      content: item.name,
      success: (res) => {
        if (!res.confirm) return;
        const newName = res.content?.trim().slice(0, ITEM_NAME_MAX);
        if (!newName) return;
        item.name = newName;
        saveItems(items);
        this.loadData();
      },
    });
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
