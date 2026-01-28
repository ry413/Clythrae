import request from "../request"

export default {
  bindDevice(agentId: string, deviceCode: string): Promise<void> {
    return request<void>(`/device/bind/${agentId}/${deviceCode}`, 'POST')
  },
  // unbindDevice(deviceId: string) {
  //   return request('/device/unbind', 'POST', { deviceId })
  // },
  manualAddDevice(agentId: string, board: string, appVersion: string, macAddress: string) : Promise<void> {
    return request<void>('/device/manual-add', 'POST', { agentId, board, appVersion, macAddress })
  }
}