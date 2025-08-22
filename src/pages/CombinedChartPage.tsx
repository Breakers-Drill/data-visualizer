import { useEffect, useState } from "react";
import mockTags from "../mockTags.json";
import CombinedChart from "../components/CombinedChart";
import Controls from "../features/sensors/components/Controls";
import LimitsPanel from "../features/sensors/components/LimitsPanel";
import { getColorByIndex } from "../components/chart/utils/colors";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import Loader from "../components/Loader";

type TagLimits = { upperLimit: number; lowerLimit: number };

export default function CombinedChartPage({
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
    selectedTags.forEach((tag) => initializeTagLimits(tag));
  }, [selectedTags]);

  const allSorted = chartsData;

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
      <div className="chart-panel" style={{ position: "relative" }}>
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
        ) : loading && (
          <Loader variant="inline" compact message="Загрузка данных..." />
        )}
        {!loading && selectedTags.length > 0 && (
          <>
            <div className="chart-header">
              <div className="chart-info">
                Выбрано тегов: {selectedTags.length}
              </div>
            </div>

            <div className="chart-wrapper" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "stretch", gap: 16 }}>
                <div
                  id="combined-chart-container"
                  style={{ flex: 1, position: "relative" }}
                >
                  <CombinedChart
                    series={selectedTags.map((tag) => ({
                      tag,
                      data: allSorted[tag] || [],
                      upperLimit: (
                        tagLimits[tag] || { upperLimit: 42, lowerLimit: 18 }
                      ).upperLimit,
                      lowerLimit: (
                        tagLimits[tag] || { upperLimit: 42, lowerLimit: 18 }
                      ).lowerLimit,
                    }))}
                    height={500}
                  />
                </div>
                <div style={{ width: 260, maxHeight: 500, overflowY: "auto" }}>
                  <LimitsPanel
                    tags={selectedTags}
                    tagLimits={tagLimits}
                    onChange={handleLimitInputChange}
                    getColor={(_, idx) => getColorByIndex(idx)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
