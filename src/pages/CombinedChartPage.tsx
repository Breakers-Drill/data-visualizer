import { useEffect, useState, useCallback } from "react";
import CombinedChart from "../components/CombinedChart";
import Controls from "../features/sensors/components/Controls";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import { useTags } from "../hooks/useTags";
import { useThresholds } from "../hooks/useThresholds";
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
  mode?: "combined" | "separate" | "single";
  onChangeMode?: (m: "combined" | "separate" | "single") => void;
  selectedTags: string[];
  startDate: string;
  endDate: string;
  interval: string;
  onTagsChange: (tags: string[]) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onIntervalChange: (interval: string) => void;
}) {
  const { tagNames, loading: tagsLoading } = useTags();
  const { getLimitsForTag, loading: thresholdsLoading } = useThresholds();
  const [tagLimits, setTagLimits] = useState<{ [tag: string]: TagLimits }>({});
  const { chartsData, loading: dataLoading } = useSensorData({
    selectedTags,
    startDate,
    endDate,
    interval,
  });

  const handleTagToggle = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  // Мемоизируем функцию получения лимитов для тега
  const getLimitsForTagMemo = useCallback((tag: string) => {
    return getLimitsForTag(tag);
  }, [getLimitsForTag]);

  // Обновляем лимиты только когда изменяются выбранные теги
  useEffect(() => {
    const newTagLimits: { [tag: string]: TagLimits } = {};
    
    selectedTags.forEach((tag) => {
      if (!tagLimits[tag]) {
        newTagLimits[tag] = getLimitsForTagMemo(tag);
      } else {
        newTagLimits[tag] = tagLimits[tag];
      }
    });
    
    // Обновляем состояние только если есть изменения
    const hasChanges = Object.keys(newTagLimits).some(
      tag => !tagLimits[tag] || 
             tagLimits[tag].upperLimit !== newTagLimits[tag].upperLimit ||
             tagLimits[tag].lowerLimit !== newTagLimits[tag].lowerLimit
    );
    
    if (hasChanges) {
      setTagLimits(newTagLimits);
    }
  }, [selectedTags, getLimitsForTagMemo, tagLimits]);

  const allSorted = chartsData;
  
  return (
    <div className="App" style={{ padding: "8px 16px 16px 16px" }}>
      <div style={{ borderBottom: "1px solid #e9ecef", marginBottom: 16 }}>
        <Controls
          selectedTags={selectedTags}
          allTags={tagNames}
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
          <button
            className={`switch-btn${mode === "single" ? " active" : ""}`}
            onClick={() => onChangeMode && onChangeMode("single")}
          >
            Одна плоскость
          </button>
        </div>
        {selectedTags.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>
            Выберите теги сенсоров
          </div>
        ) : (
          (dataLoading || tagsLoading || thresholdsLoading) && (
            <Loader variant="inline" compact message="Загрузка данных..." />
          )
        )}
        {!dataLoading && !tagsLoading && !thresholdsLoading && selectedTags.length > 0 && (
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
                      upperLimit: tagLimits[tag]?.upperLimit ?? 50,
                      lowerLimit: tagLimits[tag]?.lowerLimit ?? 10,
                    }))}
                    height={500}
                    yMode={mode === "single" ? "shared" : "banded"}
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
