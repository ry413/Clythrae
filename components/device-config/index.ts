
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
    clockFontValue: '',
    clockFontLabel: '',
    showClockFontPicker: false,
    clockFontOptions: [
      { label: '经典', value: 'font_classic' },
      { label: '数字', value: 'font_digital' },
      { label: '圆润', value: 'font_round' },
      { label: '像素', value: 'font_pixel' },
      { label: '极简', value: 'font_minimal' },
    ],

    showWeatherDisplayDialog: false,
    weatherPositionOptions: [
      { label: '不显示', value: 'hidden', icon: 'x' },
      { label: '时钟上方', value: 'above', icon: '↑' },
      { label: '时钟下方', value: 'below', icon: '↓' },
    ],
    weatherSpacingOptions: [0, 2, 4, 6, 8, 10, 12, 16, -2, -4],
    weatherPositionValue: '',
    weatherPositionLabel: '',
    weatherSpacingValue: 0,
    weatherOffsetX: 0,
    weatherOffsetY: 0,
    tempWeatherPositionValue: '',
    tempWeatherPositionLabel: '',
    tempWeatherSpacingValue: 0,
    tempWeatherOffsetX: 0,
    tempWeatherOffsetY: 0,
    weatherRegion: '',

    switchIntervalOptions: [
      { label: '不自动切换', value: 'none' },
      { label: '1分钟切换', value: '1m' },
      { label: '2分钟切换', value: '2m' },
      { label: '3分钟切换', value: '3m' },
      { label: '5分钟切换', value: '5m' },
      { label: '10分钟切换', value: '10m' },
      { label: '30分钟切换', value: '30m' },
      { label: '60分钟切换', value: '60m' },
      { label: '每天切换', value: '1d' },
    ],
    switchIntervalValue: '',
    switchIntervalLabel: '',
    switchIntervalPickerVisible: false,

    switchModeOptions: [
      { label: '顺序切换', value: 'sequential' },
      { label: '随机切换', value: 'random' },
    ],
    switchModeValue: '',
    switchModeLabel: '',
    switchModePickerVisible: false,

    localMusicEndOptions: [
      { label: '停止播放', value: 'stop' },
      { label: '顺序播放', value: 'sequential' },
      { label: '随机播放', value: 'random' },
      { label: '单曲循环', value: 'single_loop' },
    ],
    localMusicEndValue: '',
    localMusicEndLabel: '',
    localMusicEndPickerVisible: false,

    musicDuringOptions: [
      { label: '禁止设备休眠', value: 'no_sleep' },
      { label: '允许设备休眠', value: 'allow_sleep' },
    ],
    musicDuringValue: '',
    musicDuringLabel: '',
    musicDuringPickerVisible: false,

    screenOffTimeOptions: [
      { label: '永不熄屏', value: 'never' },
      { label: '30秒无操作熄屏', value: '30s' },
      { label: '1分钟无操作熄屏', value: '1m' },
      { label: '2分钟无操作熄屏', value: '2m' },
      { label: '3分钟无操作熄屏', value: '3m' },
      { label: '5分钟无操作熄屏', value: '5m' },
      { label: '10分钟无操作熄屏', value: '10m' },
      { label: '20分钟无操作熄屏', value: '20m' },
      { label: '30分钟无操作熄屏', value: '30m' },
      { label: '1小时无操作熄屏', value: '1h' },
      { label: '2小时无操作熄屏', value: '2h' },
    ],
    screenOffTimeValue: '',
    screenOffTimeLabel: '',
    screenOffTimePickerVisible: false,

    autoPowerOffOptions: [
      { label: '不自动关机', value: 'none' },
      { label: '熄屏10秒后关机', value: '10s' },
      { label: '熄屏20秒后关机', value: '20s' },
      { label: '熄屏30秒后关机', value: '30s' },
      { label: '熄屏1分钟后关机', value: '1m' },
      { label: '熄屏2分钟后关机', value: '2m' },
      { label: '熄屏3分钟后关机', value: '3m' },
      { label: '熄屏5分钟后关机', value: '5m' },
      { label: '熄屏10分钟后关机', value: '10m' },
      { label: '熄屏30分钟后关机', value: '30m' },
      { label: '熄屏1小时后关机', value: '1h' },
      { label: '熄屏2小时后关机', value: '2h' },
    ],
    autoPowerOffValue: '',
    autoPowerOffLabel: '',
    autoPowerOffPickerVisible: false,

  },
  properties: {

  },
  methods: {
    showDialog(e: any) {
      const { key } = e.currentTarget.dataset;
      if (key === 'showWeatherDisplayDialog') {
        const positionValue = this.data.weatherPositionValue || this.data.weatherPositionOptions[0]?.value || ''
        const positionLabel = this.data.weatherPositionLabel || this.getWeatherPositionLabelByValue(positionValue)
        const spacingValue = this.data.weatherSpacingValue ?? 0
        this.setData({
          tempWeatherPositionValue: positionValue,
          tempWeatherPositionLabel: positionLabel,
          tempWeatherSpacingValue: spacingValue,
          tempWeatherOffsetX: this.data.weatherOffsetX,
          tempWeatherOffsetY: this.data.weatherOffsetY,
        });
      }
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
    onChange(e: any) {
      this.setData({ tempClockColor: e.detail.value })
    },
    confirmClockColor() {
      this.closeDialog()
      this.setData({ clockColor: this.data.tempClockColor })
    },
    cancelClockColor() {
      this.closeDialog()
      this.setData({ tempClockColor: this.data.clockColor })
    },

    // 时钟字体
    getClockFontLabelByValue(value: string) {
      const item = this.data.clockFontOptions.find((opt: any) => opt.value === value)
      return item ? item.label : ''
    },
    onClockFontOpen() {
      this.setData({ showClockFontPicker: true })
    },
    onClockFontConfirm(e: any) {
      const value = e?.detail?.value?.[0] ?? this.data.clockFontValue
      const label = e?.detail?.label?.[0] ?? this.getClockFontLabelByValue(value)
      this.setData({
        showClockFontPicker: false,
        clockFontValue: value,
        clockFontLabel: label,
      })
    },
    onClockFontCancel() {
      this.setData({ showClockFontPicker: false })
    },

    // 天气显示
    getWeatherPositionLabelByValue(value: string) {
      const item = this.data.weatherPositionOptions.find((opt: any) => opt.value === value)
      return item ? item.label : ''
    },
    onWeatherPositionTap(e: any) {
      const value = e.currentTarget.dataset.value
      const label = this.getWeatherPositionLabelByValue(value)
      this.setData({
        tempWeatherPositionValue: value,
        tempWeatherPositionLabel: label,
      })
    },
    onWeatherSpacingTap(e: any) {
      const value = e.currentTarget.dataset.value
      this.setData({ tempWeatherSpacingValue: value })
    },
    onWeatherOffsetX(e: any) {
      let value = e.detail.value
      if (/^0\d+$/.test(value)) {
        value = String(parseInt(value, 10));
      }
      this.setData({ tempWeatherOffsetX: value });
    },
    onWeatherOffsetY(e: any) {
      let value = e.detail.value;
      if (/^0\d+$/.test(value)) {
        value = String(parseInt(value, 10));
      }
      this.setData({ tempWeatherOffsetY: value });
    },
    confirmWeatherDisplay() {
      this.closeDialog()
      this.setData({
        weatherPositionValue: this.data.tempWeatherPositionValue,
        weatherPositionLabel: this.data.tempWeatherPositionLabel,
        weatherSpacingValue: this.data.tempWeatherSpacingValue,
        weatherOffsetX: this.data.tempWeatherOffsetX,
        weatherOffsetY: this.data.tempWeatherOffsetY,
      })
    },
    cancelWeatherDisplay() {
      this.closeDialog()
      this.setData({
        tempWeatherPositionValue: this.data.weatherPositionValue,
        tempWeatherPositionLabel: this.data.weatherPositionLabel,
        tempWeatherSpacingValue: this.data.weatherSpacingValue,
        tempWeatherOffsetX: this.data.weatherOffsetX,
        tempWeatherOffsetY: this.data.weatherOffsetY,
      })
    },

    // 通用单列 picker
    getSimplePickerLabelByValue(options: Array<any>, value: string) {
      const item = options.find((opt: any) => opt.value === value)
      return item ? item.label : ''
    },
    onSimplePickerOpen(e: any) {
      const { key } = e.currentTarget.dataset
      this.setData({ [`${key}PickerVisible`]: true })
    },
    onSimplePickerConfirm(e: any) {
      const { key } = e.currentTarget.dataset
      const data = this.data as Record<string, any>
      const value = e?.detail?.value?.[0] ?? data[`${key}Value`]
      const label = e?.detail?.label?.[0] ?? this.getSimplePickerLabelByValue(data[`${key}Options`], value)
      this.setData({
        [`${key}PickerVisible`]: false,
        [`${key}Value`]: value,
        [`${key}Label`]: label,
      })
    },
    onSimplePickerCancel(e: any) {
      const { key } = e.currentTarget.dataset
      this.setData({ [`${key}PickerVisible`]: false })
    }
  }
})
