
Component({
  data: {
    dialogKey: '',

    clockPositionGridList: [
      { text: '顶部居左' },
      { text: '顶部居中' },
      { text: '顶部居右' },
      { text: '中部局左' },
      { text: '中部居中' },
      { text: '中部居右' },
      { text: '底部居左' },
      { text: '底部居中' },
      { text: '底部居右' },
    ],
    clockPosition: '',
    clockOffsetX: 0,
    clockOffsetY: 0,
    tempClockPosition: '',
    tempClockOffsetX: 0,
    tempClockOffsetY: 0,

    clockSwatchColors: [
      '#000000', '#FFFFFF', '#00FFFF', '#FF00FF', '#FFFF00',
      '#FF0000', '#00FF00', '#0000FF', '#00FFFF', '#FF8000'
    ],
    clockColor: '',
    tempClockColor: '',
    clockFont: '',

    weatherRegion: '',


  },
  properties: {

  },
  methods: {
    showDialog(e: any) {
      const { key } = e.currentTarget.dataset;
      this.setData({ [key]: true, dialogKey: key });
    },
    closeDialog() {
      const { dialogKey } = this.data;
      this.setData({ [dialogKey]: false });
    },

    // 时钟位置
    onClockPostionItemTap(e: any) {
      const text = e.currentTarget.dataset.id;
      this.setData({ tempClockPosition: text });
    },
    onInputOffsetX(e: any) {
      let value = e.detail.value
      if (/^0\d+$/.test(value)) {
        value = String(parseInt(value, 10));
      }
      this.setData({ tempClockOffsetX: value });
    },
    onInputOffsetY(e: any) {
      let value = e.detail.value;
      if (/^0\d+$/.test(value)) {
        value = String(parseInt(value, 10));
      }
      this.setData({ tempClockOffsetY: value });
    },
    confirmClockPosition() {
      this.closeDialog()
      this.setData({
        clockPosition: this.data.tempClockPosition,
        clockOffsetX: this.data.tempClockOffsetX,
        clockOffsetY: this.data.tempClockOffsetY
      })
    },
    cancelClockPosition() {
      this.closeDialog()
      this.setData({
        tempClockPosition: this.data.clockPosition,
        tempClockOffsetX: this.data.clockOffsetX,
        tempClockOffsetY: this.data.clockOffsetY
      })
    },

    // 时钟颜色
    confirmClockColor() {
      this.closeDialog()
      this.setData({ clockColor: this.data.tempClockColor })
    },
    cancelClockColor() {
      this.closeDialog()
      this.setData({ tempClockColor: this.data.clockColor })
    }
  }
})