import config from '~/config';
import { ApiResponse, Data, Header, Method } from '~/utils/types';

const { baseUrl } = config;

function request<T>(url: string, method: Method = 'GET', data: Data = {}): Promise<T> {
  const header: Header = {
    'content-type': 'application/json',
  };
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      dataType: 'json', // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        // HTTP状态码为200才视为成功
        if (res.statusCode === 200) {
          const body = res.data as ApiResponse<T>
          if (body.code !== 0) {
            reject(body)
            return
          }
          resolve(body.data)
        } else {
          // wx.request的特性，只要有响应就会走success回调，所以在这里判断状态，非200的均视为请求失败
          reject(res);
        }
      },
      fail(err) {
        // 断网、服务器挂了都会fail回调，直接reject即可
        reject(err);
      },
    });
  });
}

// 导出请求和服务地址
export default request;
