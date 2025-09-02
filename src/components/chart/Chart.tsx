import React, { useRef } from "react";
import type { ChartProps } from "./types";
import { useChartDimensions } from "./hooks/useChartDimensions";
import { useChartData } from "./hooks/useChartData";
import { useChartScales } from "./hooks/useChartScales";
import { isOutOfLimits, findIntersection, getValuesAtTimestamp } from "./utils/chartUtils";
import ChartGrid from "./ChartGrid";
import ChartAxes from "./ChartAxes";
import { getColorByIndex } from "./utils/colors";
import { formatTimeHHMM } from "./utils/format";

const Chart: React.FC<ChartProps> = ({
  data,
  upperLimit,
  lowerLimit,
  showXAxis = true,
  height = 500,
  allChartsData,
  tagName,
  globalVerticalLine,
  color,
  setGlobalVerticalLine,
  tagNameMap = {},
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const { dimensions, containerRef } = useChartDimensions(height);
  const { sortedData, minY, maxY } = useChartData(safeData);
  const svgRef = useRef<SVGSVGElement>(null);

  const margin = { top: 20, right: 80, bottom: 60, left: 60 };
  const chartWidth = Math.max(0, dimensions.width - margin.left - margin.right);
  const chartHeight = Math.max(0, dimensions.height - margin.top - margin.bottom);

  const scales = useChartScales(sortedData, chartWidth, chartHeight, minY, maxY);

  const handleMouseEvents = {
    chartMove: (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !setGlobalVerticalLine || sortedData.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      if (mouseX >= margin.left && mouseX <= margin.left + chartWidth) {
        const chartX = mouseX - margin.left;
        const dataIndex = Math.round((chartX / chartWidth) * (sortedData.length - 1));
        const clampedIndex = Math.max(0, Math.min(dataIndex, sortedData.length - 1));
        const nearestPoint = sortedData[clampedIndex];
        if (nearestPoint) {
          setGlobalVerticalLine({ visible: true, x: mouseX, timestamp: nearestPoint.timestamp });
        }
      } else {
        setGlobalVerticalLine({ visible: false, x: 0, timestamp: null });
      }
    },
    chartLeave: () => {
      if (setGlobalVerticalLine) {
        setGlobalVerticalLine({ visible: false, x: 0, timestamp: null });
      }
    },
  };

  const { bluePaths, redPaths } = React.useMemo(() => {
    const blue: string[] = [];
    const red: string[] = [];
    if (sortedData.length < 2) {
      return { bluePaths: blue, redPaths: red };
    }
    const yAtUpper = upperLimit !== undefined ? scales.y(upperLimit) : null;
    const yAtLower = lowerLimit !== undefined ? scales.y(lowerLimit) : null;
    for (let i = 0; i < sortedData.length - 1; i++) {
      const p1 = sortedData[i];
      const p2 = sortedData[i + 1];
      const x1 = scales.x(i);
      const y1 = scales.y(p1.value);
      const x2 = scales.x(i + 1);
      const y2 = scales.y(p2.value);
      const segmentPoints: Array<{ x: number; y: number; value: number }> = [{ x: x1, y: y1, value: p1.value }];
      const intersections: Array<{ x: number; y: number; value: number }> = [];
      if (upperLimit !== undefined && yAtUpper !== null) {
        const interU = findIntersection(p1.value, p2.value, upperLimit, x1, x2, yAtUpper);
        if (interU) intersections.push(interU);
      }
      if (lowerLimit !== undefined && yAtLower !== null) {
        const interL = findIntersection(p1.value, p2.value, lowerLimit, x1, x2, yAtLower);
        if (interL) intersections.push(interL);
      }
      intersections.sort((a, b) => a.x - b.x);
      segmentPoints.push(...intersections);
      segmentPoints.push({ x: x2, y: y2, value: p2.value });
      for (let j = 0; j < segmentPoints.length - 1; j++) {
        const sp1 = segmentPoints[j];
        const sp2 = segmentPoints[j + 1];
        const midValue = (sp1.value + sp2.value) / 2;
        const isRed = isOutOfLimits(midValue, upperLimit, lowerLimit);
        const pathSegment = `M ${sp1.x} ${sp1.y} L ${sp2.x} ${sp2.y}`;
        if (isRed) red.push(pathSegment);
        else blue.push(pathSegment);
      }
    }
    return { bluePaths: blue, redPaths: red };
  }, [sortedData, upperLimit, lowerLimit, scales]);
  const seriesColor = color ?? getColorByIndex(0);

  const xTicks: Array<{ x: number; label: string }> = React.useMemo(() => {
    const ticks: Array<{ x: number; label: string }> = [];
    const tickCount = Math.min(10, sortedData.length);
    if (tickCount <= 1) return ticks;
    for (let i = 0; i < tickCount; i++) {
      const index = Math.floor((i / (tickCount - 1)) * (sortedData.length - 1));
      const point = sortedData[index];
      const x = scales.x(index);
      const time = formatTimeHHMM(new Date(point.timestamp));
      ticks.push({ x, label: time });
    }
    return ticks;
  }, [sortedData, scales]);

  const yTicks: Array<{ y: number; label: number }> = React.useMemo(() => {
    const ticks: Array<{ y: number; label: number }> = [];
    const yTickCount = 8;
    for (let i = 0; i <= yTickCount; i++) {
      const value = minY + (maxY - minY) * (i / yTickCount);
      const y = scales.y(value);
      ticks.push({ y, label: Math.round(value * 10) / 10 });
    }
    return ticks;
  }, [minY, maxY, scales]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: `${height}px`, position: "relative" }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseEvents.chartMove}
        onMouseLeave={handleMouseEvents.chartLeave}
        style={{ cursor: sortedData.length ? "crosshair" : "default" }}
      >
        <rect width={dimensions.width} height={dimensions.height} fill="#f8f9fa" />
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <ChartGrid xTicks={xTicks} yTicks={yTicks} chartWidth={chartWidth} chartHeight={chartHeight} />
        </g>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {bluePaths.map((path, i) => (
            <path key={`blue-${i}`} d={path} stroke={seriesColor} strokeWidth={2} fill="none" />
          ))}
          {redPaths.map((path, i) => (
            <path key={`red-${i}`} d={path} stroke="#f44336" strokeWidth={2} fill="none" />
          ))}
          {upperLimit !== undefined && (
            <line x1={0} y1={scales.y(upperLimit)} x2={chartWidth} y2={scales.y(upperLimit)} stroke="#ff9800" strokeDasharray="5 5" strokeWidth={2} />
          )}
          {lowerLimit !== undefined && (
            <line x1={0} y1={scales.y(lowerLimit)} x2={chartWidth} y2={scales.y(lowerLimit)} stroke="#ff9800" strokeDasharray="5 5" strokeWidth={2} />
          )}
          {sortedData.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={scales.x(i)}
              cy={scales.y(point.value)}
              r={4}
              fill={isOutOfLimits(point.value, upperLimit, lowerLimit) ? "#f44336" : seriesColor}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
          {globalVerticalLine?.visible && globalVerticalLine.timestamp && sortedData.length > 0 && (() => {
            const targetTime = new Date(globalVerticalLine.timestamp).getTime();
            let closestIndex = 0;
            let minDiff = Math.abs(new Date(sortedData[0].timestamp).getTime() - targetTime);
            for (let i = 1; i < sortedData.length; i++) {
              const diff = Math.abs(new Date(sortedData[i].timestamp).getTime() - targetTime);
              if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
              }
            }
            const lineX = scales.x(closestIndex);
            return <line x1={lineX} y1={0} x2={lineX} y2={chartHeight} stroke="#6c757d" strokeWidth={3} strokeDasharray="8 4" opacity={0.8} />;
          })()}
        </g>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <ChartAxes xTicks={xTicks} yTicks={yTicks} chartWidth={chartWidth} chartHeight={chartHeight} showXAxis={showXAxis} />
        </g>
      </svg>

      {globalVerticalLine?.visible && globalVerticalLine.timestamp && sortedData.length > 0 && (() => {
        const targetTime = new Date(globalVerticalLine.timestamp).getTime();
        let closestIndex = 0;
        let minDiff = Math.abs(new Date(sortedData[0].timestamp).getTime() - targetTime);
        for (let i = 1; i < sortedData.length; i++) {
          const diff = Math.abs(new Date(sortedData[i].timestamp).getTime() - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        const lineX = scales.x(closestIndex);
        const tooltipX = margin.left + lineX + 10;
        return (
          <div
            style={{
              position: "absolute",
              left: tooltipX,
              top: margin.top - 30,
              backgroundColor: "#ffffff",
              color: "#212529",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              pointerEvents: "none",
              zIndex: 1000,
              whiteSpace: "nowrap",
              border: "1px solid #e9ecef",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              lineHeight: "1.2",
              minWidth: "180px",
            }}
          >
            <div style={{ fontWeight: "600", marginBottom: "8px", color: "#495057", fontSize: "13px" }}>
              {new Date(globalVerticalLine.timestamp).toLocaleString("ru-RU")}
            </div>
            {allChartsData &&
              getValuesAtTimestamp(globalVerticalLine.timestamp, allChartsData).map((item, index) => (
                <div
                  key={index}
                  style={{
                    color: item.tag === tagName ? seriesColor : "#6c757d",
                    fontSize: "11px",
                    marginBottom: "4px",
                  }}
                >
                  <strong>{tagNameMap[item.tag] || item.tag}:</strong> {item.value.toFixed(1)}
                </div>
              ))}
          </div>
        );
      })()}
    </div>
  );
};

export default Chart;


