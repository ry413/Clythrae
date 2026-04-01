import Api from "~/api/api";
import config from "~/config";
import { WallpaperDTO } from "~/utils/types";

interface WallpaperManagerData {
  deviceId: string
  wallpapers: Array<WallpaperDTO>
  selectedIds: Array<number>
  selectedIdMap: Record<string, boolean>
  loading: boolean
  saving: boolean
  uploading: boolean
  screenWidth: number
  screenHeight: number
}

Component<WallpaperManagerData, any, any, any, any, true>({
  data: {
    deviceId: '',
    wallpapers: [],
    selectedIds: [],
    selectedIdMap: {},
    loading: false,
    saving: false,
    uploading: false,
    screenWidth: 0,
    screenHeight: 0
  },
  properties: {
    deviceId: String
  },
  lifetimes: {
    attached() {
      this.loadData()
      this.getScreenInfo()
    }
  },
  methods: {
    
    async loadData() {
      this.setData({ loading: true })
      try {
        const [wallpapers, selectedIds] = await Promise.all([
          Api.wallpaper.getWallpaperList(),
          Api.device.getDeviceWallpaperIds(this.data.deviceId)
        ])
        const normalizedWallpapers = (wallpapers || []).map((item: WallpaperDTO) => ({
          ...item,
          id: Number(item.id),
          url: this.buildWallpaperUrl(item.fileKey),
        }))
        this.setData({
          wallpapers: normalizedWallpapers,
          selectedIds: selectedIds || [],
          selectedIdMap: this.buildSelectedMap(selectedIds || [])
        })
      } catch (e) {
        console.error(e)
        wx.showToast({ title: '加载壁纸失败', icon: 'none' })
      } finally {
        this.setData({ loading: false })
      }
    },
    buildSelectedMap(ids: Array<number>) {
      const map: Record<string, boolean> = {}
      ids.forEach((id) => {
        map[String(id)] = true
      })
      return map
    },
    buildWallpaperUrl(fileKey: string) {
      if (!fileKey) return ''
      if (/^https?:\/\//i.test(fileKey)) return fileKey
      const base = (config?.assetBaseUrl || '').replace(/\/+$/, '')
      return base ? `${base}/${fileKey}` : fileKey
    },
    toggleWallpaper(e: any) {
      const id = Number(e.currentTarget.dataset.id)
      if (Number.isNaN(id)) return
      const selectedIdMap = { ...this.data.selectedIdMap }
      let selectedIds = [...this.data.selectedIds]
      const mapKey = String(id)
      if (selectedIdMap[mapKey]) {
        delete selectedIdMap[mapKey]
        selectedIds = selectedIds.filter((item) => item !== id)
      } else {
        selectedIdMap[mapKey] = true
        selectedIds.push(id)
      }
      this.setData({ selectedIdMap, selectedIds })
    },
    async saveSelection() {
      if (!this.data.deviceId) return
      this.setData({ saving: true })
      try {
        await Api.device.setDeviceWallpaperIds(this.data.deviceId, this.data.selectedIds)
        wx.showToast({ title: '已保存', icon: 'success' })
      } catch (e) {
        console.error(e)
        wx.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.setData({ saving: false })
      }
    },
    async onUploadTap() {
      if (this.data.uploading) return
      if (!this.data.screenWidth || !this.data.screenHeight) {
        await this.getScreenInfo()
      }
      if (!this.data.screenWidth || !this.data.screenHeight) {
        wx.showToast({ title: '未获取到屏幕尺寸', icon: 'none' })
        return
      }
      const remain = Math.max(0, 10 - (this.data.wallpapers?.length || 0))
      if (remain <= 0) {
        wx.showToast({ title: '壁纸数量已达上限(10)', icon: 'none' })
        return
      }

      wx.chooseMedia({
        count: Math.min(9, remain),
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        camera: 'back',
        success: async (res) => {
          const files = res.tempFiles || []
          if (!files.length) return
          
          this.setData({ uploading: true })
          try {
            if (files.length === 1) {
              const filePath = files[0]?.tempFilePath
              if (filePath) {
                const manualCropped = await this.cropImageWithRatio(filePath)
                const croppedPath = await this.cropToScreen(manualCropped)
                await Api.wallpaper.uploadWallpaper(croppedPath)
              }
            } else {
              for (const file of files) {
                const filePath = file?.tempFilePath
                if (!filePath) continue
                const croppedPath = await this.cropToScreen(filePath)
                await Api.wallpaper.uploadWallpaper(croppedPath)
              }
            }
            wx.showToast({ title: '上传成功', icon: 'success' })
            this.loadData()
          } catch (e: any) {
            console.error(e)
            // wx.showToast({ title: '上传失败', icon: 'none' })
            const msg = e?.message === 'image too small'
              ? '图片尺寸小于屏幕，无法裁剪'
              : '上传失败'
            wx.showToast({ title: msg, icon: 'none' })
          
          } finally {
            this.setData({ uploading: false })
          }
        }
      })
    },
    getClosestCropScale() {
      const width = this.data.screenWidth
      const height = this.data.screenHeight
      const target = width / height
      const ratios: Array<[number, number]> = [
        [16, 9], [9, 16],
        [5, 4], [4, 5],
        [4, 3], [3, 4],
        [1, 1],
      ]
      let best = ratios[0]
      let bestDiff = Math.abs(target - best[0] / best[1])
      for (const r of ratios) {
        const diff = Math.abs(target - r[0] / r[1])
        if (diff < bestDiff) {
          best = r
          bestDiff = diff
        }
      }
      return `${best[0]}:${best[1]}`
    },
    cropImageWithRatio(filePath: string): Promise<string> {
      const cropScale = this.getClosestCropScale()
      return new Promise((resolve, reject) => {
        wx.cropImage({
          src: filePath,
          cropScale,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        })
      })
    },
    async onDeleteWallpaper(e: any) {
      const id = Number(e.currentTarget.dataset.id)
      if (Number.isNaN(id)) return
      try {
        await Api.wallpaper.deleteWallpaper(id)
        const wallpapers = this.data.wallpapers.filter((item: WallpaperDTO) => item.id !== id)
        const selectedIdMap = { ...this.data.selectedIdMap }
        const mapKey = String(id)
        if (selectedIdMap[mapKey]) delete selectedIdMap[mapKey]
        const selectedIds: Array<number> = this.data.selectedIds.filter((item: number) => item !== id)
        this.setData({ wallpapers, selectedIds, selectedIdMap })
        if (this.data.deviceId) {
          await Api.device.setDeviceWallpaperIds(this.data.deviceId, selectedIds)
        }
        wx.showToast({ title: '已删除', icon: 'success' })
      } catch (e) {
        console.error(e)
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    },
    async getScreenInfo() {
      try {
        const raw: any = await Api.device.executeMcpTools(this.data.deviceId, 'self.screen.get_info')
        let res = JSON.parse(raw)
        const text = res?.data?.content?.[0]?.text || ''
        let info: any = null
        if (text) {
          console.log('text: ', text)
          try {
            info = JSON.parse(text)
          } catch (err) {
            console.warn('screen info parse failed:', text)
            info = null
          }
        }
        const width = Number(info?.width || 0)
        const height = Number(info?.height || 0)

        console.log('w: ', width, 'h: ', height)
        if (width && height) {
          this.setData({ screenWidth: width, screenHeight: height })
        } else {
          console.warn('screen info missing width/height:', res)
        }
      } catch (e) {
        wx.showToast({ title: '获取屏幕信息失败', icon: 'error' })
        console.error(e)
      }
    },

    cropToScreen(filePath: string): Promise<string> {
      const targetW = this.data.screenWidth
      const targetH = this.data.screenHeight
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: filePath,
          success: (img) => {
            const srcW = img.width
            const srcH = img.height
            if (srcW < targetW || srcH < targetH) {
              reject(new Error('image too small'))
              return
            }
            const scale = Math.max(targetW / srcW, targetH / srcH)
            const drawW = srcW * scale
            const drawH = srcH * scale
            const offsetX = (targetW - drawW) / 2
            const offsetY = (targetH - drawH) / 2
            const ctx = wx.createCanvasContext('cropperCanvas', this)
            ctx.clearRect(0, 0, targetW, targetH)
            ctx.drawImage(filePath, offsetX, offsetY, drawW, drawH)
            ctx.draw(false, () => {
              wx.canvasToTempFilePath({
                canvasId: 'cropperCanvas',
                width: targetW,
                height: targetH,
                destWidth: targetW,
                destHeight: targetH,
                success: (r) => resolve(r.tempFilePath),
                fail: reject
              }, this)
            })
          },
          fail: reject
        })
      })
    }
  }
})
