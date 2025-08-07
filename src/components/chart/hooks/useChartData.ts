import type { DataPoint } from "../types";

export const useChartData = (data: DataPoint[]) => {
  // Сортируем данные по времени
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Находим диапазон данных
  const values = sortedData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
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
