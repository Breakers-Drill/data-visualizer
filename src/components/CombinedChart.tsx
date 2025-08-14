import React, { useMemo, useRef, useState, useCallback } from "react";
import type { DataPoint } from "./chart/types";
import { useChartDimensions } from "./chart/hooks/useChartDimensions";
import ChartGrid from "./chart/ChartGrid";
import ChartAxes from "./chart/ChartAxes";
import { getValuesAtTimestamp, isOutOfLimits, findIntersection } from "./chart/utils/chartUtils";
import { getColorByIndex } from "./chart/utils/colors";
import { formatTimeHHMM } from "./chart/utils/format";

export interface CombinedSeries {
  tag: string;
  data: DataPoint[];
  upperLimit?: number;
  lowerLimit?: number;
  color?: string;
}

interface CombinedChartProps {
  series: CombinedSeries[];
  height?: number;
  showXAxis?: boolean;
}

export const CombinedChart: React.FC<CombinedChartProps> = ({
  series,
  height = 500,
  showXAxis = true,
}) => {
  const { dimensions, containerRef } = useChartDimensions(height);
  const svgRef = useRef<SVGSVGElement>(null);

  // Отступы
  const miniAxisWidth = 48;
  const baseLeftMargin = 60;
  const margin = { top: 20, right: 160, bottom: 60, left: baseLeftMargin + miniAxisWidth };
  const chartWidth = Math.max(0, dimensions.width - margin.left - margin.right);
  const chartHeight = Math.max(0, dimensions.height - margin.top - margin.bottom);

  // Собираем домены
  const { minTime, maxTime, minY, maxY, colorsMap, allChartsData } = useMemo(() => {
    let minTime = Number.POSITIVE_INFINITY;
    let maxTime = Number.NEGATIVE_INFINITY;
    const allValues: number[] = [];
    const allChartsData: { [tag: string]: DataPoint[] } = {};
    const colorsMap: Record<string, string> = {};

    series.forEach((s, i) => {
      const sorted = [...s.data].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      allChartsData[s.tag] = sorted;
      if (sorted.length > 0) {
        const first = new Date(sorted[0].timestamp).getTime();
        const last = new Date(sorted[sorted.length - 1].timestamp).getTime();
        minTime = Math.min(minTime, first);
        maxTime = Math.max(maxTime, last);
        for (const p of sorted) allValues.push(p.value);
      }
      colorsMap[s.tag] = s.color ?? getColorByIndex(i);
    });

    if (!isFinite(minTime) || !isFinite(maxTime) || minTime === maxTime) {
      const now = Date.now();
      minTime = now - 60_000;
      maxTime = now;
    }

    const minValue = allValues.length ? Math.min(...allValues) : 0;
    const maxValue = allValues.length ? Math.max(...allValues) : 1;
    const range = Math.max(1e-6, maxValue - minValue);
    const minY = minValue - range * 0.1;
    const maxY = maxValue + range * 0.1;

    return { minTime, maxTime, minY, maxY, colorsMap, allChartsData };
  }, [series]);

  // Скейлы
  const x = useCallback(
    (timeMs: number) => chartWidth * ((timeMs - minTime) / Math.max(1, maxTime - minTime)),
    [chartWidth, minTime, maxTime]
  );
  const y = useCallback(
    (value: number) => chartHeight - ((value - minY) / Math.max(1e-6, maxY - minY)) * chartHeight,
    [chartHeight, minY, maxY]
  );

  // Индивидуальные шкалы по сериям и диапазоны для мини-осей
  const perSeriesY = useMemo(() => {
    const map: Record<string, { y: (v: number) => number; min: number; max: number; top: number; height: number }> = {};
    const count = Math.max(1, series.length);
    const bandTotalHeight = chartHeight / count;
    const bandPadding = 10;
    const bandInnerHeight = Math.max(1, bandTotalHeight - bandPadding * 2);
    series.forEach((s, idx) => {
      const values = (s.data || []).map((d) => d.value);
      const minVal = values.length ? Math.min(...values) : 0;
      const maxVal = values.length ? Math.max(...values) : 1;
      const range = Math.max(1e-6, maxVal - minVal);
      const localMin = minVal - range * 0.1;
      const localMax = maxVal + range * 0.1;
      const top = idx * bandTotalHeight + bandPadding;
      const yLocal = (v: number) => top + (bandInnerHeight - ((v - localMin) / Math.max(1e-6, localMax - localMin)) * bandInnerHeight);
      map[s.tag] = { y: yLocal, min: localMin, max: localMax, top, height: bandInnerHeight };
    });
    return map;
  }, [series, chartHeight]);

  // Пунктирные горизонтальные линии по всему графику (визуальные)
  const yTicksGrid = useMemo(() => {
    const count = 6;
    const ticks: Array<{ y: number; label: number }> = [];
    for (let i = 0; i <= count; i++) {
      const yPos = (chartHeight * i) / count;
      ticks.push({ y: yPos, label: i });
    }
    return ticks;
  }, [chartHeight]);

  // Состояние для вертикальной линии
  const [hover, setHover] = useState<{
    visible: boolean;
    timestamp: string | null;
  }>({ visible: false, timestamp: null });

  // Тики
  const xTicks = useMemo(() => {
    const count = 10;
    const ticks: Array<{ x: number; label: string; time: number }> = [];
    for (let i = 0; i < count; i++) {
      const t = minTime + ((maxTime - minTime) * i) / Math.max(1, count - 1);
      ticks.push({
        x: x(t),
        label: formatTimeHHMM(new Date(t)),
        time: t,
      });
    }
    return ticks;
  }, [minTime, maxTime, x]);

  // Поиск ближайшего времени по первому непустому ряду
  const snapTime = (approxTime: number): string | null => {
    const base = series.find((s) => s.data.length > 0);
    if (!base) return null;
    const sorted = [...base.data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    let best: DataPoint | null = null;
    let minDiff = Infinity;
    for (const p of sorted) {
      const t = new Date(p.timestamp).getTime();
      const d = Math.abs(t - approxTime);
      if (d < minDiff) {
        minDiff = d;
        best = p;
      }
    }
    return best ? best.timestamp : null;
  };

  if (!series || series.length === 0) {
    return (
      <div ref={containerRef} style={{ width: "100%", height }}>
        <div style={{ color: "#ccc", padding: 16 }}>Нет данных для отображения</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: "crosshair" }}
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const chartX = mouseX - margin.left;
          if (chartX < 0 || chartX > chartWidth) {
            setHover({ visible: false, timestamp: null });
            return;
          }
          const approx = minTime + (chartX / Math.max(1, chartWidth)) * (maxTime - minTime);
          const snapped = snapTime(approx);
          setHover({ visible: !!snapped, timestamp: snapped });
        }}
        onMouseLeave={() => setHover({ visible: false, timestamp: null })}
      >
        <rect width={dimensions.width} height={dimensions.height} fill="transparent" />

        {/* Сетка */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <ChartGrid xTicks={xTicks} yTicks={yTicksGrid} chartWidth={chartWidth} chartHeight={chartHeight} />
          {series.length > 1 && (() => {
            const count = Math.max(1, series.length);
            const bandTotalHeight = chartHeight / count;
            const lines: React.ReactElement[] = [];
            for (let i = 1; i < count; i++) {
              const ySep = i * bandTotalHeight;
              lines.push(<line key={`sep-${i}`} x1={0} y1={ySep} x2={chartWidth} y2={ySep} stroke="#2a2a2a" strokeDasharray="2 2" />);
            }
            return <>{lines}</>;
          })()}
        </g>

        {/* Линии серий и уставки */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {series.map((s) => {
            const sorted = [...s.data].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            if (sorted.length < 2) return null;

            // адаптер скейлов под findIntersection (x по индексу -> x по времени точки индекса)
            const idxToX = (idx: number) => {
              const t = new Date(sorted[Math.max(0, Math.min(sorted.length - 1, idx))].timestamp).getTime();
              return x(t);
            };
            const yLocal = perSeriesY[s.tag]?.y ?? y;
            const scales = { x: (idx: number) => idxToX(idx), y: (val: number) => yLocal(val) };

            const bluePaths: string[] = [];
            const redPaths: string[] = [];

            for (let i = 0; i < sorted.length - 1; i++) {
              const point1 = sorted[i];
              const point2 = sorted[i + 1];
              const x1 = idxToX(i);
              const y1 = yLocal(point1.value);
              const x2 = idxToX(i + 1);
              const y2 = yLocal(point2.value);

              const segmentPoints: Array<{ x: number; y: number; value: number }> = [
                { x: x1, y: y1, value: point1.value },
              ];
              const intersections: Array<{ x: number; y: number; value: number }> = [];

              if (s.upperLimit !== undefined) {
                const inter = findIntersection(point1, point2, s.upperLimit, scales as unknown as { x: (index: number) => number; y: (value: number) => number }, sorted as unknown as DataPoint[]);
                if (inter) intersections.push(inter);
              }
              if (s.lowerLimit !== undefined) {
                const inter = findIntersection(point1, point2, s.lowerLimit, scales as unknown as { x: (index: number) => number; y: (value: number) => number }, sorted as unknown as DataPoint[]);
                if (inter) intersections.push(inter);
              }

              intersections.sort((a, b) => a.x - b.x);
              segmentPoints.push(...intersections);
              segmentPoints.push({ x: x2, y: y2, value: point2.value });

              for (let j = 0; j < segmentPoints.length - 1; j++) {
                const p1 = segmentPoints[j];
                const p2 = segmentPoints[j + 1];
                const midValue = (p1.value + p2.value) / 2;
                const isRed = isOutOfLimits(midValue, s.upperLimit, s.lowerLimit);
                const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
                if (isRed) redPaths.push(d);
                else bluePaths.push(d);
              }
            }

            return (
              <g key={s.tag}>
                {bluePaths.map((d, i) => (
                  <path key={`b-${s.tag}-${i}`} d={d} stroke={colorsMap[s.tag]} strokeWidth={2} fill="none" />
                ))}
                {redPaths.map((d, i) => (
                  <path key={`r-${s.tag}-${i}`} d={d} stroke="#f44336" strokeWidth={2} fill="none" />
                ))}

                {(() => {
                  const showLimits = false; // временно отключаем линии уставок
                  return (
                    <>
                      {showLimits && s.upperLimit !== undefined && (
                        <line x1={0} y1={yLocal(s.upperLimit)} x2={chartWidth} y2={yLocal(s.upperLimit)} stroke="#ff9800" strokeDasharray="5 5" opacity={0.8} />
                      )}
                      {showLimits && s.lowerLimit !== undefined && (
                        <line x1={0} y1={yLocal(s.lowerLimit)} x2={chartWidth} y2={yLocal(s.lowerLimit)} stroke="#ff9800" strokeDasharray="5 5" opacity={0.8} />
                      )}
                    </>
                  );
                })()}

                {sorted.map((p, i) => (
                  <circle
                    key={`pt-${s.tag}-${i}`}
                    cx={idxToX(i)}
                    cy={yLocal(p.value)}
                    r={3}
                    fill={isOutOfLimits(p.value, s.upperLimit, s.lowerLimit) ? "#f44336" : colorsMap[s.tag]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ))}

                {/* Подпись линии справа у последней точки */}
                {(() => {
                  const last = sorted[sorted.length - 1];
                  const lastTime = new Date(last.timestamp).getTime();
                  const baseX = x(lastTime);
                  const labelX = Math.min(chartWidth + 10, baseX + 8);
                  const labelY = yLocal(last.value);
                  return (
                    <text x={labelX} y={labelY} fill={colorsMap[s.tag]} fontSize={12} alignmentBaseline="middle" >
                      {s.tag}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Вертикальная линия */}
          {hover.visible && hover.timestamp && (() => {
            const timeMs = new Date(hover.timestamp!).getTime();
            const lineX = x(timeMs);
            return (
              <line x1={lineX} y1={0} x2={lineX} y2={chartHeight} stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" opacity={0.8} />
            );
          })()}
        </g>

        {/* Оси */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Основная ось Y без подписей (условная) и ось X */}
          <ChartAxes
            xTicks={xTicks}
            yTicks={[]}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            showXAxis={showXAxis}
            showYAxisTicks={false}
            showYAxisLabels={false}
          />

          {/* Мини-оси для каждой серии, расположенные вертикально друг под другом */}
          {series.map((s) => {
            const stats = perSeriesY[s.tag];
            if (!stats) return null;
            const tickCount = 4;
            const ticks: Array<{ y: number; label: string }> = [];
            for (let i = 0; i <= tickCount; i++) {
              const v = stats.min + ((stats.max - stats.min) * i) / tickCount;
              ticks.push({ y: stats.y(v), label: String(Math.round(v * 10) / 10) });
            }
            const axisX = -12; // еще ближе к основной оси Y
            return (
              <g key={`mini-axis-${s.tag}`}>
                <g transform={`translate(${axisX},0)`}>
                  {/* мини-ось внутри своей секции; добавлен зазор чтобы оси не соприкасались */}
                  <line x1={0} y1={stats.top} x2={0} y2={stats.top + stats.height} stroke={colorsMap[s.tag]} strokeWidth={1.5} />
                  {ticks.map((t, i2) => (
                    <g key={`t-${s.tag}-${i2}`}>
                      <line x1={0} y1={t.y} x2={-5} y2={t.y} stroke={colorsMap[s.tag]} strokeWidth={1} />
                      <text x={-8} y={t.y + 3} textAnchor="end" fill={colorsMap[s.tag]} fontSize={10}>
                        {t.label}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Тултип */}
      {hover.visible && hover.timestamp && (() => {
        const timeMs = new Date(hover.timestamp).getTime();
        const tooltipX = margin.left + x(timeMs) + 10;
        const values = getValuesAtTimestamp(hover.timestamp, allChartsData);
        return (
          <div
            style={{
              position: "absolute",
              left: tooltipX,
              top: margin.top - 30,
              backgroundColor: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "8px 12px",
              borderRadius: 4,
              fontSize: 11,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{new Date(hover.timestamp).toLocaleString("ru-RU")}</div>
            {series.map((s) => {
              const item = values.find((v) => v.tag === s.tag);
              const v = item?.value;
              return (
                <div key={s.tag} style={{ color: colorsMap[s.tag] }}>
                  {s.tag}: <strong>{v !== undefined ? v.toFixed(1) : "—"}</strong>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default CombinedChart;


