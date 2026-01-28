Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    }
  },

  methods: {
    onMaskTap() {
      // 可选择在点遮罩时也触发取消
      this.triggerEvent('cancel');
    },

    onCancel() {
      this.triggerEvent('cancel');
    },

    onConfirm() {
      this.triggerEvent('confirm');
    }
  }
});