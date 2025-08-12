import { useEffect, useState } from "react";
import "../App.css";
import Chart from "../components/chart/Chart";
import { getColorByIndex } from "../components/chart";
import mockTags from "../mockTags.json";
import Controls from "../features/sensors/components/Controls";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import Loader from "../components/Loader";

interface TagLimits {
  upperLimit: number;
  lowerLimit: number;
}

export default function SeparateChartsPage() {
  const [tagLimits, setTagLimits] = useState<{ [tag: string]: TagLimits }>({
    "DC_out_100ms[148]": { upperLimit: 42, lowerLimit: 18 },
  });
  const [startDate, setStartDate] = useState<string>("2025-08-01T17:30:00");
  const [endDate, setEndDate] = useState<string>("2025-08-02T19:34:00");
  const [interval, setInterval] = useState<string>("1min");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "DC_out_100ms[148]",
  ]);

  const { chartsData } = useSensorData({
    selectedTags,
    startDate,
    endDate,
    interval,
  });

  const [globalVerticalLine, setGlobalVerticalLine] = useState<{
    visible: boolean;
    x: number;
    timestamp: string | null;
  }>({ visible: false, x: 0, timestamp: null });

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLimitInputChange = (
    tag: string,
    type: "upper" | "lower",
    value: string
  ) => {
    const numericValue = value === "" ? 0 : parseFloat(value);
    setTagLimits((prev) => ({
      ...prev,
      [tag]: {
        ...prev[tag],
        [type === "upper" ? "upperLimit" : "lowerLimit"]: numericValue,
      },
    }));
  };

  const initializeTagLimits = (tag: string) => {
    setTagLimits((prev) => ({
      ...prev,
      [tag]: prev[tag] || { upperLimit: 42, lowerLimit: 18 },
    }));
  };

  useEffect(() => {
    selectedTags.forEach((tag) => {
      initializeTagLimits(tag);
    });
  }, [selectedTags]);

  // Рендерим скелет без данных, чтобы избежать «моргания»

  if (Object.keys(chartsData).length === 0) {
    return (
      <div className="App">
      <div style={{ borderBottom: "1px solid #333", marginBottom: 16 }}>
        <Controls
          selectedTags={selectedTags}
          allTags={mockTags as unknown as string[]}
          startDate={startDate}
          endDate={endDate}
          interval={interval}
          onToggleTag={handleTagToggle}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          onInterval={setInterval}
        />
      </div>
        <div className="chart-panel">
          <div className="chart-header">
            <h2 className="chart-title">График данных сенсора</h2>
            <div className="chart-info">Выбрано графиков: {selectedTags.length}</div>
          </div>
          <Loader variant="inline" compact message="Загрузка данных..." />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
        <div style={{ borderBottom: "1px solid #333", marginBottom: 16 }}>
          <Controls
        selectedTags={selectedTags}
        allTags={mockTags as unknown as string[]}
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        onToggleTag={handleTagToggle}
        onStartDate={setStartDate}
        onEndDate={setEndDate}
        onInterval={setInterval}
          />
        </div>

      <div className="chart-panel">
        <div className="chart-header">
          <h2 className="chart-title">График данных сенсора</h2>
          <div className="chart-info">Выбрано графиков: {selectedTags.length}</div>
        </div>

        <div className="charts-container">
          {selectedTags.map((tag, index) => {
            const isLastChart = index === selectedTags.length - 1;
            const data = chartsData[tag] || [];
            const limits = tagLimits[tag] || { upperLimit: 42, lowerLimit: 18 };
            const color = getColorByIndex(index);

            return (
              <div key={tag} className="chart-wrapper">
                <div className="chart-title-small">
                  {tag} ({data.length} точек)
                </div>

                <div className="limits-controls">
                  <div className="limit-group">
                    <label className="limit-label">Верхняя уставка:</label>
                    <div className="limit-input-container">
                      <input
                        type="number"
                        value={limits.upperLimit}
                        onChange={(e) =>
                          handleLimitInputChange(tag, "upper", e.target.value)
                        }
                        className="limit-input"
                        placeholder="0.0"
                        step="0.1"
                        min="-999"
                        max="999"
                      />
                    </div>
                  </div>

                  <div className="limit-group">
                    <label className="limit-label">Нижняя уставка:</label>
                    <div className="limit-input-container">
                      <input
                        type="number"
                        value={limits.lowerLimit}
                        onChange={(e) =>
                          handleLimitInputChange(tag, "lower", e.target.value)
                        }
                        className="limit-input"
                        placeholder="0.0"
                        step="0.1"
                        min="-999"
                        max="999"
                      />
                    </div>
                  </div>
                </div>

                <Chart
                  data={data}
                  upperLimit={limits.upperLimit}
                  lowerLimit={limits.lowerLimit}
                  showXAxis={isLastChart}
                  height={300}
                  allChartsData={chartsData}
                  tagName={tag}
                  color={color}
                  globalVerticalLine={globalVerticalLine}
                  setGlobalVerticalLine={setGlobalVerticalLine}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


