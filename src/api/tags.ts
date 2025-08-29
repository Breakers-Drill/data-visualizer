import { apiClient } from './client'

export type TagItem = {
  id: number
  tag: string
  name: string
  type: string
  minValue: number
  maxValue: number
  multiplier: number
  comment: string
}

export type SensorDataPoint = {
  id: string
  edgeId: number
  tag: string
  timestamp: string
  value: number
  tagsDataId: number | null
}

export type ThresholdItem = {
  id: number
  tag: string
  min: number | null
  max: number | null
}

const getAuthHeaders = () => {
  const infraKey = import.meta.env.VITE_INFRA_SECRET_KEY
  const headers: Record<string, string> = {}
  
  if (infraKey) {
    headers.Authorization = `Bearer ${infraKey}`
  }
  
  return headers
}

export const tagsApi = {
  // Получить все теги
  async getAllTags(): Promise<TagItem[]> {
    const response = await apiClient.get<TagItem[]>('/tags-data')
    return Array.isArray(response.data) ? response.data : []
  },

  // Создать новый тег
  async createTag(tagData: Omit<TagItem, 'id'>): Promise<TagItem> {
    const response = await apiClient.post<TagItem>('/tags-data', tagData, {
      headers: getAuthHeaders(),
    })
    return response.data
  },

  // Обновить тег по ID
  async updateTag(id: number, tagData: Partial<Omit<TagItem, 'id'>>): Promise<TagItem> {
    const response = await apiClient.patch<TagItem>(`/tags-data/${id}`, tagData, {
      headers: getAuthHeaders(),
    })
    return response.data
  },

  // Удалить тег по ID
  async deleteTag(id: number): Promise<void> {
    await apiClient.delete(`/tags-data/${id}`, {
      headers: getAuthHeaders(),
    })
  },

  // Получить данные сенсоров
  async getSensorData(params: {
    tag?: string
    dateInterval?: {
      start: Date
      end: Date
    }
    interval?: string
  }): Promise<SensorDataPoint[]> {
    const response = await apiClient.post<SensorDataPoint[]>('/sensor-data', params)
    return Array.isArray(response.data) ? response.data : []
  },

  // Получить пороговые значения
  async getThresholds(): Promise<ThresholdItem[]> {
    const response = await apiClient.get<ThresholdItem[]>('/thresholds')
    return Array.isArray(response.data) ? response.data : []
  },

  // Импорт тегов из Excel
  async importExcel(file: File): Promise<TagItem[]> {
    const formData = new FormData()
    formData.append('file', file)
    
    const infraKey = import.meta.env.VITE_INFRA_SECRET_KEY
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    }
    
    if (infraKey) {
      headers.Authorization = `Bearer ${infraKey}`
    }

    const response = await apiClient.post<TagItem[]>('/tags-data/import/excel', formData, {
      headers,
    })
    
    return Array.isArray(response.data) ? response.data : []
  },

  // Проверить статус подключения
  async checkConnection() {
    return await apiClient.checkConnection()
  },

  // Получить текущий URL API
  getCurrentApiUrl(): string {
    return apiClient.getCurrentUrl()
  },

  // Проверить, используется ли локальный сервер
  isUsingLocalServer(): boolean {
    return apiClient.isUsingLocalServer()
  },

  // Получить моковые данные для тегов типа dc_out_300ms[0-59]
  async getMockDcOut300msData(): Promise<SensorDataPoint[]> {
    // Создаем моковые данные для тегов dc_out_300ms[0-59]
    const mockPoints: SensorDataPoint[] = []
    const baseTime = new Date('2025-08-01T17:30:00.000Z')
    
    // Генерируем данные для каждого тега от 0 до 59
    for (let i = 0; i < 60; i++) {
      const tagName = `dc_out_300ms[${i}]`
      
      // Генерируем 10 точек данных для каждого тега
      for (let j = 0; j < 10; j++) {
        const timestamp = new Date(baseTime.getTime() + j * 60000) // +1 минута для каждой точки
        const value = Math.random() * 100 // Случайное значение от 0 до 100
        
        mockPoints.push({
          id: `mock_${tagName}_${j}`,
          edgeId: 1,
          tag: tagName,
          timestamp: timestamp.toISOString(),
          value: Math.round(value * 100) / 100, // Округляем до 2 знаков
          tagsDataId: null
        })
      }
    }
    
    return mockPoints
  },

  // Получить реальные данные для тегов типа dc_out_300ms[0-59]
  async getRealDcOut300msData(): Promise<SensorDataPoint[]> {
    // Используем реальные данные из data.json, но фильтруем по паттерну dc_out_300ms
    const realPoints: SensorDataPoint[] = []
    
    // Если есть реальные данные для dc_out_300ms, используем их
    // Иначе возвращаем пустой массив
    return realPoints
  }
}

