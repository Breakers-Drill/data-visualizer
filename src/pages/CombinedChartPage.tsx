import { useEffect, useState } from "react";
import mockTags from "../mockTags.json";
import CombinedChart from "../components/CombinedChart";
import Controls from "../features/sensors/components/Controls";
import LimitsPanel from "../features/sensors/components/LimitsPanel";
import { getColorByIndex } from "../components/chart/utils/colors";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import Loader from "../components/Loader";

type TagLimits = { upperLimit: number; lowerLimit: number };

export default function CombinedChartPage() {
  const [tagLimits, setTagLimits] = useState<{ [tag: string]: TagLimits }>({
    "DC_out_100ms[148]": { upperLimit: 42, lowerLimit: 18 },
  });
  const [startDate, setStartDate] = useState<string>("2025-08-01T17:30:00");
  const [endDate, setEndDate] = useState<string>("2025-08-02T19:34:00");
  const [interval, setInterval] = useState<string>("1min");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "DC_out_100ms[148]",
  ]);
  const { chartsData, loading } = useSensorData({
    selectedTags,
    startDate,
    endDate,
    interval,
  });

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
    selectedTags.forEach((tag) => initializeTagLimits(tag));
  }, [selectedTags]);

  const allSorted = chartsData;

  return (
    <div className="App" style={{ padding: 16 }}>
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

      <div className="chart-panel" style={{ position: "relative" }}>
        {loading && (
          <Loader variant="inline" compact message="Загрузка данных..." />
        )}
        {!loading && (
          <>
            <div className="chart-header">
              <h2 className="chart-title">Тест изменений Общий график</h2>
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
