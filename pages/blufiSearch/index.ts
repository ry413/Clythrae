import xBlufi, { XBlufiType } from '../../utils/blufi/xBlufi'

function updateStep(steps: Steps, key: string, patch: { status: StepStatus, desc: string }) {
  const idx = steps.findIndex(s => s.key === key)
  if (idx >= 0) {
    steps[idx] = { ...steps[idx], ...patch }
  }
  return steps
}

type Steps = Array<{ key: string, title: string, desc: string, status: StepStatus }>
type StepStatus = 'doing' | 'todo' | 'done' | 'error'

interface BlufiSearchPageData {
  devicesList: any[]
  searching: boolean
  steps: Steps
}

Component<BlufiSearchPageData, any, any, any, any, true>({
  data: {
    devicesList: [],
    searching: false,
    steps: [
      { key: 'wifi', title: 'wifi可用', desc: '检测wifi是否开启', status: 'doing' },
      { key: 'bt', title: '蓝牙可用', desc: '检测蓝牙是否开启', status: 'todo' },
      { key: 'scan', title: '开始搜索设备', desc: '扫描附近蓝牙设备', status: 'todo' },
      { key: 'pick', title: '选择设备', desc: '点击列表中的设备', status: 'todo' },
      { key: 'conn', title: '等待连接', desc: '建立连接进入配网', status: 'todo' },
    ],
  },
  lifetimes: {
    attached() {
      xBlufi.initXBlufi(xBlufi.XMQTT_SYSTEM.WeChat);

      this._onBlufiMsg = (options: any) => this.funListenDeviceMsgEvent(options);
      xBlufi.listenDeviceMsgEvent(true, this._onBlufiMsg);

      this.checkWifi();
    },
    detached() {
      xBlufi.listenDeviceMsgEvent(false, this._onBlufiMsg);
      wx.stopWifi();
      wx.offBluetoothAdapterStateChange();
      wx.closeBluetoothAdapter()
    },
  },
  methods: {
    checkWifi() {
      wx.getSetting({
        // 随手检查一下
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'wifi', { status: 'done', desc: 'wifi已开启' })
            this.setData({ steps })
            this.checkBluetooth();
          } else {
            wx.showToast({
              title: '获取wifi权限错误',
              icon: 'error',
              duration: 2000
            })
          }
        }
      })
    },

    checkBluetooth() {
      let steps = this.data.steps.slice()
      steps = updateStep(steps, 'bt', { status: 'doing', desc: '检测蓝牙是否开启' })
      this.setData({ steps })

      // 监听蓝牙状态变化(用户去系统里打开/关闭蓝牙时)
      wx.onBluetoothAdapterStateChange((res) => {
        if (res.available && !this.data.searching) {
          let steps2 = this.data.steps.slice()
          steps2 = updateStep(steps2, 'bt', { status: 'done', desc: '蓝牙已开启' })
          steps2 = updateStep(steps2, 'scan', { status: 'doing', desc: '准备开始扫描…' })
          this.setData({ steps: steps2 })
          this.scanDevice(true)
        } else if (!res.available && this.data.searching) {
          let steps2 = this.data.steps.slice()
          steps2 = updateStep(steps2, 'bt', { status: 'error', desc: '请开启手机蓝牙' })
          steps2 = updateStep(steps2, 'scan', { status: 'todo', desc: '等待蓝牙开启' })
          this.setData({ steps: steps2 })
          this.scanDevice(false)
        }
      })

      wx.openBluetoothAdapter({
        success: () => {
          let steps2 = this.data.steps.slice()
          steps2 = updateStep(steps2, 'bt', { status: 'done', desc: '蓝牙可用' })
          steps2 = updateStep(steps2, 'scan', { status: 'doing', desc: '准备开始扫描…' })
          this.setData({ steps: steps2 })
          this.scanDevice(true)
        },
        fail: () => {
          let steps2 = this.data.steps.slice()
          steps2 = updateStep(steps2, 'bt', { status: 'error', desc: '蓝牙未开启，请在系统设置中打开' })
          steps2 = updateStep(steps2, 'scan', { status: 'todo', desc: '等待蓝牙开启' })
          this.setData({ steps: steps2 })
          this.scanDevice(false)
        }
      })
    },

    funListenDeviceMsgEvent(options: { type: XBlufiType, result: boolean, data: any }) {
      switch (options.type) {
        case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_START:
          if (!options.result) {
            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'bt', { status: 'error', desc: '蓝牙未开启' })
            steps = updateStep(steps, 'scan', { status: 'todo', desc: '无法开始扫描' })
            this.setData({ steps, searching: false })
            wx.showToast({ title: '蓝牙未开启', icon: 'none' })
          } else {
            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'scan', { status: 'doing', desc: '正在扫描附近设备…' })
            this.setData({ steps, searching: true })
          }
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS:
          if (options.result) {
            this.setData({ devicesList: options.data })

            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'scan', { status: 'done', desc: `发现 ${options.data.length || 0} 台设备` })
            steps = updateStep(steps, 'pick', { status: 'doing', desc: '请选择要连接的设备' })
            this.setData({ steps })
          }
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_STOP:
          this.setData({ searching: false })
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_CONNECTED:
          console.log("连接回调：" + JSON.stringify(options))
          if (options.result) {
            wx.showToast({ title: '连接成功', icon: 'none' })

            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'conn', { status: 'done', desc: '连接成功' })
            this.setData({ steps })
            wx.navigateTo({
              url: `/pages/blufiDevice/index?btMac=${options.data.deviceId}&name=${encodeURIComponent(options.data.name)}`
            })
            
          } else {
            wx.hideLoading()
            console.log('TYPE_CONNECTED fail')
            wx.showToast({ title: '连接失败, 请重试', icon: 'error' })

            let steps = this.data.steps.slice()
            steps = updateStep(steps, 'conn', { status: 'error', desc: '连接失败，请重试' })
            steps = updateStep(steps, 'pick', { status: 'doing', desc: '请重新选择设备' })
            this.setData({ steps })
          }
          break;

      }
    },
    scanDevice(isStart: boolean) {
      if (isStart == this.data.searching) return
      this.setData({ searching: isStart })
      xBlufi.notifyStartDiscoverBle({ isStart: isStart })
    },

    Connect(e: any) {
      //停止搜索
      // xBlufi.notifyStartDiscoverBle({ isStart: false })

      for (var i = 0; i < this.data.devicesList.length; i++) {
        if (e.currentTarget.id === this.data.devicesList[i].deviceId) {
          let name = this.data.devicesList[i].name

          let steps = this.data.steps.slice()
          steps = updateStep(steps, 'pick', { status: 'done', desc: `已选择：${name || '设备'}` })
          steps = updateStep(steps, 'conn', { status: 'doing', desc: '正在连接…' })
          this.setData({ steps })

          xBlufi.notifyConnectBle({
            isStart: true,
            deviceId: e.currentTarget.id,
            name
          });

          wx.showLoading({ title: '连接蓝牙设备中...' })
        }
      }
    },
  },
});