// 历史记录页
import type { Item, Confirmation } from '../../types';
import { get } from '../../utils/storage';

Page({
  data: {
    historyGroups: [] as Array<{ date: string, records: Array<Confirmation & { itemName: string, itemIcon: string }> }>,
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const items = get<Item[]>('memo_items', []);
    const itemMap: Record<string, Item> = {};
    items.forEach(i => { itemMap[i.id] = i; });

    const confirmations = get<Confirmation[]>('memo_confirmations', []);
    // 按日期分组
    const groups: Record<string, Array<Confirmation & { itemName: string, itemIcon: string }>> = {};
    confirmations.forEach(c => {
      if (!groups[c.date]) groups[c.date] = [];
      const item = itemMap[c.itemId];
      groups[c.date].push({
        ...c,
        itemName: item ? item.name : '已删除',
        itemIcon: item ? item.icon : '❓',
      });
    });

    const sorted = Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, records]) => ({ date, records }));

    this.setData({ historyGroups: sorted });
  },
});
