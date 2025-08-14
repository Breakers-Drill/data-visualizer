import type { DataPoint } from '../types'

// Функция для определения, находится ли значение за пределами уставок
export const isOutOfLimits = (value: number, upperLimit?: number, lowerLimit?: number): boolean => {
	return (upperLimit !== undefined && value > upperLimit) || (lowerLimit !== undefined && value < lowerLimit)
}

// Функция для нахождения пересечения с уставкой
// Принимает значения на концах сегмента и уже вычисленные координаты x1/x2 и y уставки
export const findIntersection = (
  value1: number,
  value2: number,
  limit: number,
  x1: number,
  x2: number,
  yAtLimit: number
) => {
  const crosses = (value1 - limit) * (value2 - limit) < 0
  if (!crosses) return null

  const ratio = (limit - value1) / (value2 - value1)
  const x = x1 + (x2 - x1) * ratio
  const y = yAtLimit

  return { x, y, value: limit }
}

// Функция для получения значений всех тегов в определенной временной точке
export const getValuesAtTimestamp = (
  timestamp: string,
  allChartsData?: { [tag: string]: DataPoint[] }
): Array<{ tag: string; value: number }> => {
  if (!allChartsData) return []

  const targetTime = new Date(timestamp).getTime()
  const values: Array<{ tag: string; value: number }> = []

  for (const [tag, tagData] of Object.entries(allChartsData)) {
    if (!tagData || tagData.length === 0) continue
    let closestPoint = tagData[0]
    let minDiff = Math.abs(new Date(closestPoint.timestamp).getTime() - targetTime)
    for (let i = 1; i < tagData.length; i++) {
      const diff = Math.abs(new Date(tagData[i].timestamp).getTime() - targetTime)
      if (diff < minDiff) {
        minDiff = diff
        closestPoint = tagData[i]
      }
    }
    if (minDiff <= 5 * 60 * 1000) values.push({ tag, value: closestPoint.value })
  }

  return values
}
