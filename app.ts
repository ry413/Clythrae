// app.js
import createBus from './utils/eventBus';
import request from './api/request';
import { TokenDTO } from './utils/types';

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

  loginPromise: null as Promise<void> | null,
  loginReady: false,

  ensureLogin(): Promise<void> {
    if (this.loginPromise) return this.loginPromise;
    if (this.loginReady) return Promise.resolve();
    return this.login();
  },

  login(): Promise<void> {
    if (this.loginPromise) return this.loginPromise;
    this.loginPromise = new Promise<void>((resolve, reject) => {
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
              this.loginReady = true;
              resolve();
            }).catch((err) => {
              console.log('登录失败失败: ', err)
              this.loginReady = false;
              reject(err);
            })
          } else {
            console.log('登录失败');
            this.loginReady = false;
            reject(new Error('no code'));
          }
        },
        fail: (err) => {
          console.log(err)
          this.loginReady = false;
          reject(err);
        }
      })
    }).finally(() => {
      this.loginPromise = null;
    });
    return this.loginPromise;
  },
});
