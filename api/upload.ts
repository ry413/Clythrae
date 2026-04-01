import config from '~/config';
import { ApiResponse, Header } from '~/utils/types';

const { baseUrl } = config;

export function upload<T>(
  url: string,
  filePath: string,
  name = 'file',
  formData?: Record<string, string>
): Promise<T> {
  const header: Header = {
    'content-type': 'application/json',
  };
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: baseUrl + url,
      filePath,
      name,
      formData,
      header,
      success(res) {
        if (res.statusCode !== 200) {
          reject(res)
          return
        }
        try {
          const body = JSON.parse(res.data) as ApiResponse<T>
          if (body.code !== 0) {
            reject(body)
            return
          }
          resolve(body.data)
        } catch (e) {
          reject(e)
        }
      },
      fail: reject,
    })
  })
}
