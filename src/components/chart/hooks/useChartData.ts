import type { DataPoint } from "../types";

export const useChartData = (data: DataPoint[]) => {
  // Предполагаем, что данные уже отсортированы на этапе загрузки
  const sortedData = data;

  if (!sortedData || sortedData.length === 0) {
    return {
      sortedData: [],
      minValue: 0,
      maxValue: 1,
      minY: 0,
      maxY: 1,
    };
  }

  // Находим диапазон данных
  const values = sortedData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = Math.max(1e-6, maxValue - minValue);
  const minY = minValue - valueRange * 0.1;
  const maxY = maxValue + valueRange * 0.1;

  return {
    sortedData,
    minValue,
    maxValue,
    minY,
    maxY,
  };
};
