import { AgentDTO } from '~/utils/types';
import Api from '~/api/api';
import { ActionSheet, ActionSheetTheme } from "tdesign-miniprogram/";

interface AgentPageData {
  agents: Array<AgentDTO & { agentId: string, deviceId: string, deviceIsAlive: boolean }>
  actionSheetHidden: boolean
  showActiveCodeInputDialog: boolean
  activeCode: string
  refreshEnable: boolean
}

Component<AgentPageData, any, any, any, any, true>({
  data: {
    agents: [],
    actionSheetHidden: true,
    showActiveCodeInputDialog: false,
    activeCode: '',
    refreshEnable: false
  },
  pageLifetimes: {
    show() {
      this.fetchAgentList()
    }
  },
  methods: {
    onRefresh() {
      this.refresh();
    },
    async refresh() {
      this.setData({ refreshEnable: true });
      await Promise.all([
        this.fetchAgentList(),
        new Promise(resolve => setTimeout(resolve, 1000)) // 至少刷新个1秒不然太快了
      ])
      this.setData({ refreshEnable: false });
    },
    handleAddActionSelected(e: any) {
      console.log(e)
      if (e.detail.selected == '新设备配网') {
        this.addNewDevice()
      } else if (e.detail.selected == '验证码绑定') {
        this.showActiveCodeDialog()
      }
    },
    handleAddAction() {
      ActionSheet.show({
        align: 'center',
        description: '',
        theme: ActionSheetTheme.List,
        selector: '#t-action-sheet',
        context: this,
        cancelText: 'cancel',
        items: ['新设备配网', '验证码绑定'],
      });
    },
    showActiveCodeDialog() {
      this.setData({ showActiveCodeInputDialog: true, activeCode: '' });
    },
    closeActiveCodeDialog() {
      this.setData({ showActiveCodeInputDialog: false });
    },
    onActiveCodeChange(e: any) {
      const v = e?.detail?.value ?? '';
      this.setData({ activeCode: v });
    },
    onActiveCodeConfirm() {
      const code = (this.data.activeCode || '').trim();
      console.log('confirm code:', code)

      if (!/^\d{6}$/.test(code)) {
        wx.showToast({
          title: '请输入6位数字验证码',
          icon: 'none',
        });
        return
      }

      Api.agent.addAgent(`小智-${this.data.activeCode}`).then((agentId) => {
        Api.device.bindDevice(agentId, this.data.activeCode).then(() => {
          this.fetchAgentList()
        }).catch((err) => {
          console.log('绑定失败: ', err)
        })
      })

      this.closeActiveCodeDialog()
    },

    addNewDevice() {
      this.getWifiScope()
    },
    getWifiScope() {
      wx.showModal({
        title: '请确保设备已开机',
        content: '并打开wifi与蓝牙',
        confirmText: '开始扫描',
        success: (res) => {
          if (res.confirm) {
            // 1.打开wifi模块
            console.log('打开wifi模块')
            wx.startWifi({
              success: () => {
                // 2.获取精确位置权限
                wx.getSetting({
                  success: (res) => {
                    if (!res.authSetting['scope.userLocation']) {
                      wx.authorize({
                        scope: 'scope.userLocation',
                        // 3a.用户初次授权
                        success: () => this.checkWifi(),
                        // 3b.用户初次拒绝授权或早已经拒绝过
                        fail: () => {
                          wx.showModal({
                            title: '获取位置权限失败',
                            content: '本程序需要位置权限才能使用此功能',
                            confirmText: '去授权',
                            success: (res) => {
                              if (res.confirm) {
                                wx.openSetting()
                              }
                            }
                          })
                        }
                      })
                    } else {
                      // 3c.有权限
                      this.checkWifi()
                    }
                  }
                })
              },
              // wx.startWifi
              fail: (err) => {
                wx.showModal({
                  title: '请打开wifi后重试',
                  content: err.errMsg,
                  confirmText: '好的',
                  showCancel: false,
                })
              }
            })
          }
        },
      })
    },
    checkWifi() {
      // 1.检查已连接wifi以判断wifi功能是否打开
      wx.getConnectedWifi({
        // 2a.已连接wifi
        success: () => this.getBluetoothScope(),
        fail: (err) => {
          // 2b.系统wifi功能未打开
          if (err.errCode == 12005) {
            wx.showModal({
              title: '请打开wifi后重试',
              content: err.errMsg,
              confirmText: '好的',
              showCancel: false,
            })
          } else {
            // 2c.wifi功能已打开, 只是别的报错
            console.log(err)
            this.getBluetoothScope()
          }
        },
      })
    },
    getBluetoothScope() {
      // 1.获取蓝牙权限
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.bluetooth']) {
            wx.authorize({
              scope: 'scope.bluetooth',
              // 2a.用户初次授权
              success: () => this.checkBluetooth(),
              // 2b.用户初次拒绝授权或早已经拒绝过
              fail: () => {
                wx.showModal({
                  title: '获取蓝牙权限失败',
                  content: '本程序需要蓝牙权限才能使用此功能',
                  confirmText: '去授权',
                  success: (res) => {
                    if (res.confirm) {
                      wx.openSetting()
                    }
                  }
                })
              }
            })
          } else {
            // 2c.有权限
            this.checkBluetooth()
          }
        }
      })
    },
    checkBluetooth() {
      wx.openBluetoothAdapter({
        success: () => {
          wx.navigateTo({
            url: '/pages/blufiSearch/index',
          });
        },
        fail: (err) => {
          wx.showModal({
            title: '请打开蓝牙后重试',
            content: err.errMsg,
            confirmText: '好的',
            showCancel: false,
          })
        }
      })
    },
    async fetchAgentList() {
      try {
        const agentList = await Api.agent.getAgentList()
        // 删除可能不知道什么时候残留的无设备绑定的智能体
        const toDelete = agentList.filter(agent => agent.deviceCount === 0)
        let toKeep = await Promise.all(
          agentList.filter(agent => agent.deviceCount !== 0)
            .map(async agent => {
              try {
                const status = await Api.device.getDeviceStatus(agent.id)
                const statusInfo: any = Object.values(JSON.parse(status))[0];

                let isOnline = false;
                if (statusInfo.isAlive === true) {
                  isOnline = true;
                } else if (statusInfo.isAlive === false) {
                  isOnline = false;
                } else if (statusInfo.isAlive === null && statusInfo.exists === true) {
                  isOnline = true;
                } else {
                  isOnline = false;
                }

                return { ...agent, agentId: agent.id, deviceIsAlive: isOnline }
              } catch {
                return { ...agent, agentId: agent.id, deviceIsAlive: false }
              }
            })
        )
        this.setData({ agents: toKeep })

        await Promise.all(
          toDelete.map(agent => Api.agent.deleteAgent(agent.id))
        )
      } catch (e) {
        console.log('获取智能体列表失败: ', e)
        wx.showToast({ title: '获取列表失败', icon: 'error' })
      }
    },
    goToAgentConfigPage(e: WechatMiniprogram.TouchEvent) {
      const agentId = e.currentTarget.dataset.agentId
      wx.navigateTo({
        url: `/pages/agentConfig/index?agentId=${agentId}`
      })
    }

  }
});
