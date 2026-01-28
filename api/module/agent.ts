import { AgentDetail, AgentDTO, RoleTemplate } from "~/utils/types";
import request from "../request"

export default {
  getAgentList(): Promise<Array<AgentDTO>> {
    return request<Array<AgentDTO>>('/agent/list')
  },
  addAgent(agentName: string): Promise<string> {
    return request<string>('/agent', 'POST', { agentName })
  },
  deleteAgent(agentId: string) : Promise<void> {
    return request<void>(`/agent/${agentId}`, 'DELETE')
  },
  getAgentDetail(agentId: string): Promise<AgentDetail> {
    return request<AgentDetail>(`/agent/${agentId}`, 'GET')
  },
  getAgentTemplates(): Promise<Array<RoleTemplate>> {
    return request<Array<RoleTemplate>>('/agent/template')
  },
  updateAgent(agentId: string, data: Partial<AgentDetail>): Promise<void> {
    return request<void>(`/agent/${agentId}`, 'PUT', data)
  },
  getAgnetMcpAccessAddress(agentId: string): Promise<string> {
    return request<string>(`/agent/mcp/address/${agentId}`)
  }
}