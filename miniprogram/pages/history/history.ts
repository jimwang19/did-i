import { get } from '../../utils/storage';

Page({
  data: {
    historyGroups: [],
    statusBarHeight: 0,
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const items = get('memo_items', []);
    const itemMap = {};
    items.forEach(i => { itemMap[i.id] = i; });

    const confirmations = get('memo_confirmations', []);
    const groups = {};
    confirmations.forEach(c => {
      if (!groups[c.date]) groups[c.date] = [];
      const item = itemMap[c.itemId];
      groups[c.date].push({
        ...c,
        timestampShort: c.timestamp.slice(0, 5),
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
