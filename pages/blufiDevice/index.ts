import xBlufi, { XBlufiType } from '../../utils/blufi/xBlufi'
import Api from '~/api/api';


interface BlufiDevicePageData {
  selectedWifiIndex: number
  wifiList: Array<any>
  deviceInitOK: boolean
  wifiInitOK: boolean
  password: string
  deviceConnNetSuccess: boolean
}

Component<BlufiDevicePageData, any, any, any, any, true>({
  data: {
    selectedWifiIndex: 0,
    wifiList: [],
    deviceInitOK: false,
    wifiInitOK: false,
    password: '',
    deviceConnNetSuccess: false
  },
  properties: {
    btMac: { type: String, value: '' },
    name: { type: String, value: '' },
  },
  lifetimes: {
    attached() {
      this.initWifi()
      this._onBlufiMsg = (options: any) => this.funListenDeviceMsgEvent(options);
      xBlufi.listenDeviceMsgEvent(true, this._onBlufiMsg);
      xBlufi.notifyInitBleEsp32({ deviceId: this.data.btMac })
      wx.showLoading({ title: '设备初始化中', })
    },
    detached() {
      xBlufi.notifyConnectBle({
        isStart: false,
        deviceId: this.data.btMac,
        name: this.data.name,
      });
      xBlufi.listenDeviceMsgEvent(false, this._onBlufiMsg);
    }
  },
  methods: {
    funListenDeviceMsgEvent(options: { type: XBlufiType, result: boolean, data: any }) {
      switch (options.type) {
        case xBlufi.XBLUFI_TYPE.TYPE_STATUS_CONNECTED:
          if (!options.result) {
            if (this.data.deviceConnNetSuccess) {
              wx.showLoading({ title: '配网完成, 正在绑定设备' })
              // 自动创建一个智能体, 名字直接用设备名
              Api.agent.addAgent(this.data.name).then((agentId) => {
                // 版本号随便填, 会被后台修正
                Api.device.manualAddDevice(agentId, 'xiaozhu2', '1.0.0', this.data.wifiMac).then(() => {
                  wx.hideLoading()
                  // 回到home页
                  wx.showToast({ title: '成功添加设备' })
                  wx.navigateBack({ delta: getCurrentPages().length })
                }).catch((err) => {
                  console.log('手动添加设备失败: ', err)
                  // 添加设备失败的话就把智能体删了
                  Api.agent.deleteAgent(agentId)
                })
              }).catch((err) => {
                console.log('addAgent fail: ', err)
              })
            } else {
              wx.showModal({
                title: '连接发生错误',
                content: '小程序与设备异常断开, 请重试',
                showCancel: false,
                success: () => {
                  wx.navigateBack()
                },
              })
            }
          }
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_CONNECT_ROUTER_RESULT:
          console.log('!!! TYPE_CONNECT_ROUTER_RESULT 触发')
          // wx.hideLoading();
          if (!options.result)
            wx.showModal({
              title: '温馨提示',
              content: '配网失败，请重试',
              showCancel: false, //是否显示取消按钮
            })
          else {
            if (options.data.progress == 100) {
              let ssid = options.data.ssid;
              wx.showModal({
                title: '温馨提示',
                content: `连接成功路由器【${options.data.ssid}】`,
                showCancel: false,
                success: () => {
                  wx.setStorage({
                    key: ssid,
                    data: this.data.password
                  })
                },
              })
            }
          }
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_RECIEVE_CUSTON_DATA:
          console.log("收到设备发来的自定义数据结果：", (options.data))
          let customDataObj: { type: string, wifiMac: string | null };
          try {
            customDataObj = JSON.parse(options.data);
            console.log("解析后的对象: ", customDataObj);
            if (customDataObj.type == 'ESP_BLUFI_STA_CONN_SUCCESS') {
              this.setData({ deviceConnNetSuccess: true })
              this.setData({ wifiMac: customDataObj.wifiMac })
            } else if (customDataObj.type == 'ESP_BLUFI_STA_CONN_FAIL') {
              this.setData({ deviceConnNetSuccess: false })
            }
          } catch (e) {
            console.error("自定义数据不是合法 JSON: ", options.data);
          }
          break;
        case xBlufi.XBLUFI_TYPE.TYPE_INIT_ESP32_RESULT:
          console.log("初始化结果：", JSON.stringify(options))
          wx.hideLoading();
          this.setData({ deviceInitOK: options.result, })
          if (options.result) {
            console.log('esp32初始化成功')
          } else {
            console.log('初始化失败')
            wx.showModal({
              title: '提示',
              content: `设备初始化失败, 请重试`,
              showCancel: false,
              confirmText: '好的',
              success: () => {
                wx.navigateBack()
              }
            })
          }
      }
    },
    OnClickStart() {
      if (!this.data.ssid) {
        wx.showToast({
          title: 'SSID不能为空',
          icon: 'none'
        })
        return
      }
      if (!this.data.password) {
        wx.showToast({
          title: '密码不能为空',
          icon: 'none'
        })
        return;
      }

      wx.showLoading({
        title: '正在配网',
        mask: true
      })
      xBlufi.notifySendRouterSsidAndPassword({
        ssid: this.data.ssid,
        password: this.data.password
      })
    },

    bindPasswordInput(e: any) {
      this.setData({
        password: e.detail.value
      })
    },
    bindCustomDataInput(e: any) {
      this.setData({
        customData: e.detail.value
      })
    },
    initWifi() {
      // 先清空列表，避免重复叠加
      this.setData({ wifiList: [], selectedWifiIndex: 0, wifiInitOK: false })

      // wx.showLoading({ title: '获取Wi-Fi列表...', mask: true })

      // 1) 打开 Wi-Fi 模块
      wx.startWifi({
        success: () => {
          // 2) 注册拿到列表的回调（只要 getWifiList 成功触发，回调就会进来）
          wx.onGetWifiList((res) => {
            function is24Ghz(freq: number) {
              return freq >= 2400 && freq <= 2500
            }

            function toStrength100(v: number) {
              if (v <= 1) return Math.round(v * 100)
              return Math.round(v)
            }

            const list = (res && res.wifiList) ? res.wifiList : []

            const map = new Map()
            for (const w of list) {
              const ssid = (w.SSID || '').trim()
              if (!ssid) continue
              // 只要2.4G
              if (!is24Ghz(w.frequency)) continue
              const strength = toStrength100(w.signalStrength)
              const old = map.get(ssid)
              if (old == null || strength > old) map.set(ssid, strength)
            }

            // 按强度降序
            const candidates = Array.from(map.entries())
              .map(([ssid, strength]) => ({ ssid, strength }))
              .sort((a, b) => b.strength - a.strength)

            const ssids = candidates.map(x => x.ssid)
            this.setData({ wifiList: ssids })

            // 然后拿当前连接的 Wi-Fi，决定默认选中
            wx.getConnectedWifi({
              success: (r) => {
                const cur = r?.wifi
                const curSsid = (cur?.SSID || '').trim()
                const curFreq = cur?.frequency

                let index = 0
                let chosenSsid = ssids[0] || ''

                // 当前连接是 2.4G 且也在列表里：优先选中它
                if (curSsid && is24Ghz(curFreq)) {
                  const i = ssids.indexOf(curSsid)
                  if (i >= 0) {
                    index = i
                    chosenSsid = curSsid
                  }
                }

                const pwd = chosenSsid ? wx.getStorageSync(chosenSsid) : ''

                this.setData({
                  selectedWifiIndex: index,
                  ssid: chosenSsid,
                  password: pwd == undefined ? "" : pwd,
                  wifiInitOK: !!chosenSsid
                })
                console.log('getConnectedWifi success')

                // wx.hideLoading()
              },
              fail: () => {
                // 拿不到当前连接就退回列表第一项
                const chosenSsid = ssids[0] || ''
                const pwd = chosenSsid ? wx.getStorageSync(chosenSsid) : ''

                this.setData({
                  selectedWifiIndex: 0,
                  ssid: chosenSsid,
                  password: pwd == undefined ? "" : pwd,
                  wifiInitOK: !!chosenSsid
                })

                // wx.hideLoading()
              }
            })
          })

          // 3) 发起获取列表, 触发 onGetWifiList 回调
          wx.getWifiList({
            fail: (err) => {
              // wx.hideLoading()
              console.log('getWifiList fail:', err)
              // 拿不到列表就不强求：至少允许用户手动输入 SSID（如果你愿意加输入框）
              this.setData({ wifiList: [], wifiInitOK: true })
              wx.showToast({ title: '无法获取Wi-Fi列表', icon: 'none' })
            }
          })
        },
        fail: (err) => {
          // wx.hideLoading()
          console.log('startWifi fail:', err)
          // Wi-Fi API 不可用/权限问题
          this.setData({ wifiList: [], wifiInitOK: true })
          wx.showToast({ title: 'Wi-Fi能力不可用', icon: 'none' })
        }
      })
    },

    bindPickerChange(e: any) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        selectedWifiIndex: e.detail.value
      })
      console.log("ssid=>", this.data.wifiList[e.detail.value])
      let password = wx.getStorageSync(this.data.wifiList[e.detail.value])
      console.log("password=>", password)
      this.setData({
        ssid: this.data.wifiList[e.detail.value],
        wifiInitOK: true,
        password: password == undefined ? "" : password
      })
    },
  },

})