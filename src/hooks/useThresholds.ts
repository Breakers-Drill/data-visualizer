import { useCallback, useEffect, useState } from 'react'
import { tagsApi, type ThresholdItem } from '../api/tags'

export const useThresholds = () => {
  const [thresholds, setThresholds] = useState<ThresholdItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadThresholds = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await tagsApi.getThresholds()
        setThresholds(data)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Ошибка загрузки пороговых значений'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadThresholds()
  }, [])

  // Получить пороговые значения для конкретного тега
  const getThresholdForTag = useCallback((tag: string) => {
    return thresholds.find(threshold => threshold.tag === tag)
  }, [thresholds])

  // Получить лимиты для тега в формате { upperLimit, lowerLimit }
  const getLimitsForTag = useCallback((tag: string) => {
    const threshold = getThresholdForTag(tag)
    return {
      upperLimit: threshold?.max ?? 50,
      lowerLimit: threshold?.min ?? 10,
    }
  }, [getThresholdForTag])

  return {
    thresholds,
    loading,
    error,
    getThresholdForTag,
    getLimitsForTag,
    refetch: () => {
      const loadThresholds = async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await tagsApi.getThresholds()
          setThresholds(data)
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Ошибка загрузки пороговых значений'
          setError(message)
        } finally {
          setLoading(false)
        }
      }
      loadThresholds()
    }
  }
}
