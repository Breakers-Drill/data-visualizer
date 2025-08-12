import type { DataPoint, ChartScales } from '../types'

// Функция для определения, находится ли значение за пределами уставок
export const isOutOfLimits = (value: number, upperLimit?: number, lowerLimit?: number): boolean => {
	return (upperLimit !== undefined && value > upperLimit) || (lowerLimit !== undefined && value < lowerLimit)
}

// Функция для нахождения пересечения с уставкой
export const findIntersection = (
	point1: DataPoint, 
	point2: DataPoint, 
	limit: number,
	scales: ChartScales,
	sortedData: DataPoint[]
) => {
	const crosses = (point1.value - limit) * (point2.value - limit) < 0
	if (!crosses) return null
	
	const ratio = (limit - point1.value) / (point2.value - point1.value)
	const x1 = scales.x(sortedData.indexOf(point1))
	const x2 = scales.x(sortedData.indexOf(point2))
	const x = x1 + (x2 - x1) * ratio
	const y = scales.y(limit)
	
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
