import React from "react";

interface ChartAxesProps {
  xTicks: Array<{ x: number; label: string }>;
  yTicks: Array<{ y: number; label: number }>;
  chartWidth: number;
  chartHeight: number;
  showXAxis: boolean;
  showYAxisTicks?: boolean;
  showYAxisLabels?: boolean;
  showYAxisLine?: boolean;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({
  xTicks,
  yTicks,
  chartWidth,
  chartHeight,
  showXAxis,
  showYAxisTicks = true,
  showYAxisLabels = true,
  showYAxisLine = true,
}) => {
  return (
    <>
      {showXAxis && (
        <g transform={`translate(0, ${chartHeight})`}>
          <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#6c757d" strokeWidth={1} />
          {xTicks.map((tick, i) => (
            <g key={`x-tick-${i}`}>
              <line x1={tick.x} y1={0} x2={tick.x} y2={5} stroke="#6c757d" strokeWidth={1} />
              <text x={tick.x} y={20} textAnchor="middle" fill="#495057" fontSize="12" fontWeight="500">
                {tick.label}
              </text>
            </g>
          ))}
        </g>
      )}

      <g>
        {showYAxisLine && (
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#6c757d" strokeWidth={1} />
        )}
        {(showYAxisTicks || showYAxisLabels) &&
          yTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              {showYAxisTicks && (
                <line x1={0} y1={tick.y} x2={-5} y2={tick.y} stroke="#6c757d" strokeWidth={1} />
              )}
              {showYAxisLabels && (
                <text x={-10} y={tick.y + 4} textAnchor="end" fill="#495057" fontSize="12" fontWeight="500">
                  {tick.label}
                </text>
              )}
            </g>
          ))}
      </g>
    </>
  );
};

export default ChartAxes;


