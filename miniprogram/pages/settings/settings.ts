import { saveConfirmations } from '../../utils/storage';

Page({
  data: {},

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
