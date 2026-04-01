import Api from "~/api/api";
import { AgentDetail, MODEL_TYPES, ModelType, ModelOption, RoleTemplate, VoiceDTO, AgentFunction, PluginDefinition, DeviceEntity } from "~/utils/types";

interface AgentConfigPageData {
  agentForm: Partial<AgentDetail>
  roleTemplates: Array<RoleTemplate>
  modelOptions: Record<ModelType, { label: string, value: string }[]>
  displayNames: Partial<Record<string, string>>
  currVoiceOptions: Array<{ label: string, value: string }>
  selectedTTSAndVoiceValue: Array<string>
  selectedTTSAndVoiceText: string
  allFunctions: Array<PluginDefinition>
  currentFunctions: Array<PluginDefinition>
  checkedFunctionMap: Record<string, boolean>
  currentDeviceId: string
}

Component<AgentConfigPageData, any, any, any, any, true>({
  data: {
    agentForm: {
      agentName: '',
      systemPrompt: '',
      summaryMemory: '',
      vadModelId: '',
      asrModelId: '',
      llmModelId: '',
      vllmModelId: '',
      intentModelId: '',
      memModelId: '',
      ttsModelId: '',
      ttsVoiceId: '',
    },

    roleTemplates: [],

    modelOptions: {
      VAD: [],
      ASR: [],
      LLM: [],
      VLLM: [],
      Intent: [],
      Memory: [],
      TTS: [],
    },

    currVoiceOptions: [],
    selectedTTSAndVoiceValue: [],
    selectedTTSAndVoiceText: '',

    displayNames: { LLM: '', TTS: '', VOICE: '' },

    allFunctions: [],
    currentFunctions: [],
    checkedFunctionMap: {},

    currentDeviceId: ''
  },
  properties: {
    agentId: String
  },
  observers: {
    'agentForm.llmModelId': function (llmModelId) {
      this.setData({
        'displayNames.LLM': this.data.modelOptions.LLM.find(
          (item: { label: string, value: string }) => item.value === llmModelId).label
      })
    },
    'agentForm.ttsModelId': function (ttsModelId) {
      this.setData({
        'displayNames.TTS': this.data.modelOptions.TTS.find(
          (item: { label: string, value: string }) => item.value === ttsModelId).label
      })
    },
    'agentForm.ttsVoiceId': function (ttsVoiceId) {
      this.setData({
        'displayNames.VOICE': this.data.currVoiceOptions.find(
          (item: { label: string, value: string }) => item.value === ttsVoiceId).label
      })
    },
    'currentFunctions'(currentFunctions) {
      const set = new Set((currentFunctions || []).map((x: any) => x.id));
      const map: any = {};
      (this.data.allFunctions || []).forEach((x: any) => { map[x.id] = set.has(x.id); });
      this.setData({ checkedFunctionMap: map });
    },
  },
  lifetimes: {
    async attached() {
      await Promise.all([
        this.loadRoleTemplates(),
        this.loadModelOptions(),
        this.loadPluginFunctions(),
      ])

      if (this.data.agentId) {
        await Promise.all([
          this.loadMcpAddress(),
          this.loadAgentDetail(),
          // this.loadDeviceInfo()
        ])
      }
    },
  },
  methods: {
    // 智能体名称和prompt输入框
    onAgentNameChange(e: any) {
      const v = e?.detail?.value ?? '';
      this.setData({ name: v })
    },
    onAgentPromptChange(e: any) {
      const v = e?.detail?.value ?? '';
      this.setData({ prompt: v })
    },

    // 角色模板选择
    selecteRoleTemplate(e: WechatMiniprogram.TouchEvent) {
      const selectedTemplateId = e.currentTarget.dataset.templateId
      const template: RoleTemplate = this.data.roleTemplates.find((t: RoleTemplate) => t.id === selectedTemplateId)

      if (!template) {
        console.warn('RoleTemplate not found:', selectedTemplateId)
        return
      }

      this.setData({
        agentForm: {
          ...this.data.agentForm,
          agentName: template.agentName,
          systemPrompt: template.systemPrompt
        }
      })
    },

    // picker选择器
    onPickerConfirm(e: any) {
      const { key } = e.currentTarget.dataset
      const label = e.detail.label.join(' ')
      const value = e.detail.value

      this.setData({ [`${key}PickerVisible`]: false });
      switch (key) {
        case 'llm':
          this.setData({ 'agentForm.llmModelId': value[0] })
          break
        case 'tts':
          this.setData({
            'agentForm.ttsModelId': value[0],
            'agentForm.ttsVoiceId': value[1],
            selectedTTSAndVoiceValue: value,
            selectedTTSAndVoiceText: label
          })
          break
      }
    },
    onPickerCancel(e: any) {
      const { key } = e.currentTarget.dataset;
      this.setData({
        [`${key}PickerVisible`]: false,
      });
    },
    onPickerOpen(e: any) {
      const { key } = e.currentTarget.dataset;
      this.setData({
        [`${key}PickerVisible`]: true,
      });
    },
    onVoiceColumnChange(e: any) {
      console.log('picker pick:', e.detail)
      const { column, value } = e.detail
      if (column === 0) {
        this.loadVoiceOptions(value[0], value[1])
      }
    },
    async loadVoiceOptions(ttsModelId: string, ttsVoiceId: string) {
      if (!ttsModelId || !ttsVoiceId) {
        this.setData({ currVoiceOptions: [] })
        return
      }
      try {
        const list: Array<VoiceDTO> = await Api.model.getTTSVoices(ttsModelId) ?? []
        const currVoiceOptions = list.map((item: VoiceDTO) => ({
          label: item.name, value: item.id
        }))
        
        this.setData({ currVoiceOptions, selectedTTSAndVoiceValue: [ttsModelId, ttsVoiceId] })
      } catch (e) {
        console.error(e)
        this.setData({ currVoiceOptions: [] })
        wx.showToast({ title: '获取音色失败', icon: 'error' })
      }
    },

    // 函数工具的switch回调
    onSwitchChange(e: any) {
      const id = e.currentTarget.dataset.id;
      const all = this.data.allFunctions || [];
      const cur = this.data.currentFunctions || [];

      if (e.detail.value) {
        if (!cur.some((x: any) => x.id === id)) {
          const def = all.find((x: any) => x.id === id);
          if (def) this.setData({ currentFunctions: cur.concat(def) });
        }
      } else {
        this.setData({ currentFunctions: cur.filter((x: any) => x.id !== id) });
      }
    },
    // MCP接入点地址的复制回调
    copyMcpAddress() {
      if (this.data.mcpAddress) {
        wx.setClipboardData({ data: this.data.mcpAddress })
      }
    },

    // 初始化数据
    async loadRoleTemplates() {
      try {
        const roleTemplates = await Api.agent.getAgentTemplates()
        this.setData({ roleTemplates })
      } catch (e) {
        console.error('加载角色模板失败: ', e)
      }
    },
    async loadModelOptions() {
      const modelOptions = { ...this.data.modelOptions }
      try {
        await Promise.all(
          MODEL_TYPES.map(async (type) => {
            const options = await Api.model.getModelNames(type) ?? []
            modelOptions[type] = options.map((item: ModelOption) => ({
              label: item.modelName, value: item.id
            }))
          }) || [],
        )
      } catch (e) {
        console.error('加载模型选项失败: ', e)
      }

      this.setData({ modelOptions })
    },
    async loadPluginFunctions() {
      try {
        const res = await Api.model.getPluginFunctions()
        const processedFunctions = res?.map((item) => {
          const meta = JSON.parse(item.fields || '[]')
          const params = meta.reduce((m: any, f: any) => {
            m[f.key] = f.default
            return m
          }, {})
          return { ...item, fieldsMeta: meta, params }
        }) || []
        this.setData({ allFunctions: processedFunctions })
        console.log('allFunctions: ', processedFunctions)
      } catch (e) {
        console.error('加载函数工具失败: ', e)
      }
    },
    async loadMcpAddress() {
      try {
        const mcpAddress = await Api.agent.getAgnetMcpAccessAddress(this.data.agentId)
        this.setData({ mcpAddress })
      } catch (e) {
        console.error('加载MCP接入点地址失败: ', e)
      }
    },
    async loadAgentDetail() {
      try {
        const agentDetail = await Api.agent.getAgentDetail(this.data.agentId)
        if (agentDetail.ttsModelId) {
          await this.loadVoiceOptions(agentDetail.ttsModelId, agentDetail.ttsVoiceId)
        }
        this.setData({ agentForm: { ...agentDetail } })
        console.log('智能体详情: ', this.data.agentForm)

        // 虽然是数组, 但设计上是一智能体对应一个设备, 所以我们就当作最大只有一个项
        const devices: Array<DeviceEntity> = await Api.device.getAgentBindDevices(this.data.agentId)
        if (devices.length >= 1) {
          this.setData({ currentDeviceId: devices[0].id })
        }

        const savedMappings = agentDetail.functions || []
        this.setData({
          currentFunctions: savedMappings.map((mapping) => {
            const meta = this.data.allFunctions.find((f: any) => f.id === mapping.pluginId)
            if (!meta) {
              return { id: mapping.pluginId, name: mapping.pluginId, params: {} }
            }
            return {
              id: mapping.pluginId,
              name: meta.name,
              params: mapping.paramInfo || { ...meta.params },
              fieldsMeta: meta.fieldsMeta
            }
          })
        })
        console.log('currentFunctions: ', this.data.currentFunctions)
      } catch (e) {
        console.error('加载智能体详情失败: ', e)
        wx.showToast({ title: '加载智能体详情失败' })
      }
    },

    // 保存删除
    async saveAgent() {
      if (!this.data.agentForm.agentName.trim()) {
        wx.showToast({ title: '请输入助手昵称', icon: 'error' })
        return
      }

      if (!this.data.agentForm.systemPrompt.trim()) {
        wx.showToast({ title: '请输入角色设定', icon: 'error' })
        return
      }

      try {
        this.setData({ saving: true })
        await Api.agent.updateAgent(this.data.agentId, { ...this.data.agentForm })

        wx.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) {
        console.error('保存失败: ', e)
        wx.showToast({ title: '保存失败', icon: 'error' })
      } finally {
        this.setData({ saving: false })
      }
    },
    async saveAgentFunctions() {
      try {
        this.setData({ functionsSaving: true })
        await Api.agent.updateAgent(this.data.agentId, {
          functions: this.data.currentFunctions.map((item: PluginDefinition) => ({
            pluginId: item.id, paramInfo: item.params
          }))
        })

        wx.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) {
        console.error('保存失败: ', e)
        wx.showToast({ title: '保存失败', icon: 'error' })
      } finally {
        this.setData({ functionsSaving: false })
      }
    },
    async deleteAgent() {
      wx.showModal({
        title: '确认删除',
        content: '删除后将无法恢复, 确定要删除这个智能体吗?',
        confirmText: '删除',
        confirmColor: '#e34d59',
        cancelText: '取消',
        success: async (res) => {
          if (!res.confirm) return

          try {
            await Api.agent.deleteAgent(this.data.agentId)
            wx.navigateBack({ delta: getCurrentPages().length })
          } catch (e) {
            console.log('删除智能体失败: ', e)
            wx.showToast({ title: '删除智能体失败', icon: 'error' })
          }
        }
      })
    },
  }
})
