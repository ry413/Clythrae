import request from "../request"
import { ModelOption, VoiceDTO } from "~/utils/types"

export default {
  getModelNames(modelType: string, modelName: string = ''): Promise<Array<ModelOption>> {
    return request<Array<ModelOption>>('/models/names', 'GET', { modelType, modelName })
  },
  getTTSVoices(ttsModelId: string, voiceName: string = ''): Promise<Array<VoiceDTO>> {
    return request<Array<VoiceDTO>>(`/models/${ttsModelId}/voices`, 'GET', { voiceName })
  },
  getPluginFunctions(): Promise<Array<any>> {
    return request<Array<any>>('/models/provider/plugin/names', 'GET')
  }
}