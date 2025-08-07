import type { DataPoint, ChartScales } from "../types";

export const useChartScales = (
  sortedData: DataPoint[],
  chartWidth: number,
  chartHeight: number,
  minY: number,
  maxY: number
): ChartScales => {
  const scales: ChartScales = {
    x: (index: number) => (index / (sortedData.length - 1)) * chartWidth,
    y: (value: number) =>
      chartHeight - ((value - minY) / (maxY - minY)) * chartHeight,
  };

  return scales;
};
