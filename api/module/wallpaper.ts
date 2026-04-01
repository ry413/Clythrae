import { WallpaperDTO } from "~/utils/types"
import request from "../request"
import { upload } from "../upload"

export default {
  getWallpaperList(): Promise<Array<WallpaperDTO>> {
    return request<Array<WallpaperDTO>>('/wallpaper/list')
  },
  uploadWallpaper(filePath: string) {
    return upload<WallpaperDTO>('/wallpaper/upload', filePath)
  },
  deleteWallpaper(wallpaperId: number): Promise<void> {
    return request<void>(`/wallpaper/${wallpaperId}`, 'DELETE')
  },

}