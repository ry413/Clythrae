export type Method = 'OPTIONS'
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'TRACE'
  | 'CONNECT';

export type Header = Record<string, string>;

export type Data = string | WechatMiniprogram.IAnyObject | ArrayBuffer;

export const MODEL_TYPES = [
  'VAD',
  'ASR',
  'LLM',
  'VLLM',
  'Intent',
  'Memory',
  'TTS',
] as const
export type ModelType = typeof MODEL_TYPES[number]

// 后端返回的结构格式
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface TokenDTO {
  token: string
  expire: number
  clientHash: string
}

export interface WechatLoginReq {
  code: string
}

export interface AgentDTO {
  id: string
  agentName: string
  ttsModelName: string
  ttsVoiceName: string
  llmModelName: string
  vllmModelName: string
  memModelId: string
  systemPrompt: string
  summaryMemory: string
  lastConnectedAt: string
  deviceCount: number
}

export interface AgentFunction {
  id?: string
  agentId?: string
  pluginId: string
  paramInfo: Record<string, string | number | boolean> | null
}

export interface AgentDetail {
  id: string
  userId: string
  agentCode: string
  agentName: string
  asrModelId: string
  vadModelId: string
  llmModelId: string
  vllmModelId: string
  ttsModelId: string
  ttsVoiceId: string
  memModelId: string
  intentModelId: string
  chatHistoryConf: number
  systemPrompt: string
  summaryMemory: string
  langCode: string
  language: string
  sort: number
  creator: string
  createdAt: string
  updater: string
  updatedAt: string
  functions: AgentFunction[]
}

export interface RoleTemplate {
  id: string
  agentCode: string
  agentName: string
  asrModelId: string
  vadModelId: string
  llmModelId: string
  vllmModelId: string
  ttsModelId: string
  ttsVoiceId: string
  memModelId: string
  intentModelId: string
  chatHistoryConf: number
  systemPrompt: string
  summaryMemory: string
  langCode: string
  language: string
  sort: number
  creator: string
  createdAt: string
  updater: string
  updatedAt: string
}

export interface ModelOption {
  id: string
  modelName: string
}

export interface VoiceDTO {
  id: string
  name: string
  voiceDemo: string
}

export interface PluginField {
  key: string
  type: string
  label: string
  default: string
  selected?: boolean
  editing?: boolean
}

export interface PluginDefinition {
  id: string
  modelType: string
  providerCode: string
  name: string
  fields: PluginField[] // 注意：原始是字符串，需要先 JSON.parse
  sort: number
  updater: string
  updateDate: string
  creator: string
  createDate: string
  [key: string]: any}