Component({
  properties: {
    visible: { type: Boolean, value: false },
    detail: { type: Object, value: {} },
  },
  methods: {
    onMaskTap() {
      this.triggerEvent('close');
    },
    onClose() {
      this.triggerEvent('close');
    },
    onPhotoTap() {
      const path = (this.properties.detail as any)?.photoPath;
      if (path) {
        wx.previewImage({ current: path, urls: [path] });
      }
    },
  },
});
