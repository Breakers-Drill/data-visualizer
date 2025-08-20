import React from "react";

interface ChartGridProps {
  xTicks: Array<{ x: number; label: string }>;
  yTicks: Array<{ y: number; label: number }>;
  chartWidth: number;
  chartHeight: number;
}

export const ChartGrid: React.FC<ChartGridProps> = ({ xTicks, yTicks, chartWidth, chartHeight }) => {
  return (
    <g>
      {xTicks.map((tick, i) => (
        <line key={`v-grid-${i}`} x1={tick.x} y1={0} x2={tick.x} y2={chartHeight} stroke="#dee2e6" strokeDasharray="3 3" strokeWidth={1} />
      ))}
      {yTicks.map((tick, i) => (
        <line key={`h-grid-${i}`} x1={0} y1={tick.y} x2={chartWidth} y2={tick.y} stroke="#dee2e6" strokeDasharray="3 3" strokeWidth={1} />
      ))}
    </g>
  );
};

export default ChartGrid;


