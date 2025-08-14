import type { DataPoint, ChartScales } from "../types";

export const useChartScales = (
  sortedData: DataPoint[],
  chartWidth: number,
  chartHeight: number,
  minY: number,
  maxY: number
): ChartScales => {
  const scales: ChartScales = {
    x: (index: number) => {
      const n = Math.max(1, sortedData.length - 1)
      const clamped = Math.max(0, Math.min(index, n))
      return (clamped / n) * chartWidth
    },
    y: (value: number) =>
      chartHeight - ((value - minY) / Math.max(1e-6, maxY - minY)) * chartHeight,
  };

  return scales;
};
