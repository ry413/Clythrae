// app.js
import config from './config';
import Mock from './mock/index';
import createBus from './utils/eventBus';
import { connectSocket, fetchUnreadNum } from './mock/chat';
import request from './api/request';
import { TokenDTO } from './utils/types';

if (config.isMock) {
  Mock();
}

App({
  onLaunch() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });
    this.login();
  },
  globalData: {
    userInfo: null,
    unreadNum: 0, // 未读消息数量
    socket: null, // SocketTask 对象
  },

  /** 全局事件总线 */
  eventBus: createBus(),

  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          request<TokenDTO>(`/user/wechat/login`, 'POST',
            {
              // code: res.code
              code: 'mockUserCode1'
            }
          ).then(async (res) => {
            console.log('登录成功: ', res.token)
            wx.setStorageSync('access_token', res.token);
          }).catch((err) => {
            console.log('登录失败失败: ', err)
          })
        } else {
          console.log('登录失败');
        }
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  /** 初始化WebSocket */
  // connect() {
  //   const socket = connectSocket();
  //   socket.onMessage((data) => {
  //     data = JSON.parse(data);
  //     if (data.type === 'message' && !data.data.message.read) this.setUnreadNum(this.globalData.unreadNum + 1);
  //   });
  //   this.globalData.socket = socket;
  // },

  /** 获取未读消息数量 */
  // getUnreadNum() {
  //   fetchUnreadNum().then(({ data }) => {
  //     this.globalData.unreadNum = data;
  //     this.eventBus.emit('unread-num-change', data);
  //   });
  // },

  // /** 设置未读消息数量 */
  // setUnreadNum(unreadNum: any) {
  //   this.globalData.unreadNum = unreadNum;
  //   this.eventBus.emit('unread-num-change', unreadNum);
  // },
});
