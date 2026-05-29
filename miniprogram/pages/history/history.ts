import { get } from '../../utils/storage';

const DAYS_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
];

Page({
  data: {
    historyGroups: [],
    statusBarHeight: 0,
    itemLabels: ['全部事项'],
    itemIds: ['all'],
    filterItemIndex: 0,
    daysLabels: DAYS_OPTIONS.map(o => o.label),
    filterDaysIndex: 0,
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
  },

  onShow() {
    this.loadData();
  },

  onItemFilterChange(e) {
    this.setData({ filterItemIndex: Number(e.detail.value) });
    this.loadData();
  },

  onDaysFilterChange(e) {
    this.setData({ filterDaysIndex: Number(e.detail.value) });
    this.loadData();
  },

  loadData() {
    const items = get('memo_items', []);
    const itemMap = {};
    items.forEach(i => { itemMap[i.id] = i; });

    // Rebuild item picker options
    const itemLabels = ['全部事项', ...items.map(i => `${i.icon} ${i.name}`)];
    const itemIds = ['all', ...items.map(i => i.id)];

    const selectedItemId = itemIds[this.data.filterItemIndex] || 'all';
    const selectedDays = DAYS_OPTIONS[this.data.filterDaysIndex]?.value || 0;

    let confirmations = get('memo_confirmations', []);

    // Filter by date range
    if (selectedDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - selectedDays);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      confirmations = confirmations.filter(c => c.date >= cutoffStr);
    }

    // Filter by item
    if (selectedItemId !== 'all') {
      confirmations = confirmations.filter(c => c.itemId === selectedItemId);
    }

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

    this.setData({ historyGroups: sorted, itemLabels, itemIds });
  },
});
