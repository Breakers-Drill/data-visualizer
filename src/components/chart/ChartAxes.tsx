import React from "react";

interface ChartAxesProps {
  xTicks: Array<{ x: number; label: string }>;
  yTicks: Array<{ y: number; label: number }>;
  chartWidth: number;
  chartHeight: number;
  showXAxis: boolean;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({
  xTicks,
  yTicks,
  chartWidth,
  chartHeight,
  showXAxis,
}) => {
  return (
    <>
      {showXAxis && (
        <g transform={`translate(0, ${chartHeight})`}>
          <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#cccccc" strokeWidth={1} />
          {xTicks.map((tick, i) => (
            <g key={`x-tick-${i}`}>
              <line x1={tick.x} y1={0} x2={tick.x} y2={5} stroke="#cccccc" strokeWidth={1} />
              <text x={tick.x} y={20} textAnchor="middle" fill="#cccccc" fontSize="12">
                {tick.label}
              </text>
            </g>
          ))}
        </g>
      )}

      <g>
        <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#cccccc" strokeWidth={1} />
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line x1={0} y1={tick.y} x2={-5} y2={tick.y} stroke="#cccccc" strokeWidth={1} />
            <text x={-10} y={tick.y + 4} textAnchor="end" fill="#cccccc" fontSize="12">
              {tick.label}
            </text>
          </g>
        ))}
      </g>
    </>
  );
};

export default ChartAxes;


