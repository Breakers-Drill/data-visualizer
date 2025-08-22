import { useEffect, useState } from "react";
import "../App.css";
import Chart from "../components/chart/Chart";
import { getColorByIndex } from "../components/chart/utils/colors";
import mockTags from "../mockTags.json";
import Controls from "../features/sensors/components/Controls";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import Loader from "../components/Loader";

interface TagLimits {
  upperLimit: number;
  lowerLimit: number;
}

export default function SeparateChartsPage({
  mode,
  onChangeMode,
  selectedTags,
  startDate,
  endDate,
  interval,
  onTagsChange,
  onStartDateChange,
  onEndDateChange,
  onIntervalChange,
}: {
  mode?: "combined" | "separate";
  onChangeMode?: (m: "combined" | "separate") => void;
  selectedTags: string[];
  startDate: string;
  endDate: string;
  interval: string;
  onTagsChange: (tags: string[]) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onIntervalChange: (interval: string) => void;
}) {
  const [tagLimits, setTagLimits] = useState<{ [tag: string]: TagLimits }>({
    "DC_out_100ms[148]": { upperLimit: 42, lowerLimit: 18 },
  });

  const { chartsData, loading } = useSensorData({
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
    onTagsChange(
      selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
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

  return (
    <div className="App" style={{ padding: "8px 16px 16px 16px" }}>
      <div style={{ borderBottom: "1px solid #e9ecef", marginBottom: 16 }}>
        <Controls
          selectedTags={selectedTags}
          allTags={mockTags as unknown as string[]}
          startDate={startDate}
          endDate={endDate}
          interval={interval}
          onToggleTag={handleTagToggle}
          onStartDate={onStartDateChange}
          onEndDate={onEndDateChange}
          onInterval={onIntervalChange}
        />
      </div>
      <div className="chart-panel">
        <div className="charts-switcher" style={{ marginBottom: 8 }}>
          <button
            className={`switch-btn${mode === "combined" ? " active" : ""}`}
            onClick={() => onChangeMode && onChangeMode("combined")}
          >
            Совмещенный график
          </button>
          <button
            className={`switch-btn${mode === "separate" ? " active" : ""}`}
            onClick={() => onChangeMode && onChangeMode("separate")}
          >
            Отдельные графики
          </button>
        </div>

        {selectedTags.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>
            Выберите теги сенсоров
          </div>
        ) : loading ? (
          <Loader variant="inline" compact message="Загрузка данных..." />
        ) : (
          <>
            <div className="chart-header">
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
          </>
        )}
      </div>
    </div>
  );
}
