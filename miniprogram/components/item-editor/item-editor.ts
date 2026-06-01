import { ICON_PRESETS, ITEM_NAME_MAX } from '../../utils/constants';

Component({
  properties: {
    visible: { type: Boolean, value: false },
    /** 传入已有事项时为编辑模式；不传（null）为新增模式 */
    editItem: { type: Object, value: null },
  },

  data: {
    name: '',
    selectedIcon: ICON_PRESETS[0],
    icons: [...ICON_PRESETS],
    maxLen: ITEM_NAME_MAX,
  },

  observers: {
    'visible, editItem'(visible: boolean, editItem: any) {
      if (!visible) return;
      if (editItem) {
        this.setData({ name: editItem.name, selectedIcon: editItem.icon });
      } else {
        this.setData({ name: '', selectedIcon: ICON_PRESETS[0] });
      }
    },
  },

  methods: {
    onNameInput(e: any) {
      this.setData({ name: e.detail.value.slice(0, ITEM_NAME_MAX) });
    },

    onIconTap(e: any) {
      this.setData({ selectedIcon: e.currentTarget.dataset.icon });
    },

    onConfirm() {
      const name = this.data.name.trim();
      if (!name) {
        wx.showToast({ title: '请输入事项名称', icon: 'none' });
        return;
      }
      this.triggerEvent('confirm', { name, icon: this.data.selectedIcon });
    },

    onClose() {
      this.triggerEvent('close');
    },

    onMaskTap(e: any) {
      if (e.target === e.currentTarget) {
        this.triggerEvent('close');
      }
    },

    onSheetTap() {
      // prevent bubbling to mask
    },
  },
});
