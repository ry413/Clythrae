import { DeviceEntity } from "~/utils/types"
import request from "../request"

export default {
  bindDevice(agentId: string, deviceCode: string): Promise<void> {
    return request<void>(`/device/bind/${agentId}/${deviceCode}`, 'POST')
  },
  manualAddDevice(agentId: string, board: string, appVersion: string, macAddress: string): Promise<void> {
    return request<void>('/device/manual-add', 'POST', { agentId, board, appVersion, macAddress })
  },
  getAgentBindDevices(agentId: string): Promise<Array<DeviceEntity>> {
    return request<Array<DeviceEntity>>(`/device/bind/${agentId}`)
  },
  getDeviceStatus(agentId: string): Promise<string> {
    return request<string>(`/device/bind/${agentId}`, 'POST')
  },
  setDeviceWallpaperIds(deviceId: string, wallpaperIds: Array<number>): Promise<void> {
    return request<void>(`/device/wallpapers/${deviceId}`, 'POST', wallpaperIds)
  },
  getDeviceWallpaperIds(deviceId: string): Promise<Array<number>> {
    return request<Array<number>>(`/device/wallpapers/${deviceId}`)
  },
  sendDeviceCommand(deviceId: string, data: Record<string, any>): Promise<string> {
    return request<string>(`/device/commands/${deviceId}`, 'POST', data)
  },
  executeMcpTools(deviceId: string, toolsName: string, args: object = {}): Promise<string> {
    const mcpExecuteString = {
      type: "mcp",
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: toolsName,
          arguments: args,
        },
      },
    };
    return this.sendDeviceCommand(deviceId, mcpExecuteString)
  }
}