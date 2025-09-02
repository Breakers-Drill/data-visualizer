import { useEffect, useState, useCallback } from "react";
import CombinedChart from "../components/CombinedChart";
import Controls from "../features/sensors/components/Controls";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import { useTags } from "../hooks/useTags";
import { useThresholds } from "../hooks/useThresholds";
import { useEdges } from "../hooks/useEdges";
import { useEdgeBlocks, useBlockTags } from "../hooks/useBlocks";
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
  initialEdgeKey,
  initialBlockName,
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
  initialEdgeKey?: string | null;
  initialBlockName?: string | null;
}) {
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(initialEdgeKey || null);
  const [selectedBlockName, setSelectedBlockName] = useState<string | null>(initialBlockName || null);
  
  const { edges, loading: edgesLoading } = useEdges();
  const { blocks, loading: blocksLoading } = useEdgeBlocks(selectedEdgeKey);
  const { tags: blockTags, loading: blockTagsLoading } = useBlockTags(selectedEdgeKey, selectedBlockName);
  
  const { tagNames, getTagNameMap, loading: tagsLoading } = useTags();
  const { getLimitsForTag, loading: thresholdsLoading } = useThresholds();
  const [tagLimits, setTagLimits] = useState<{ [tag: string]: TagLimits }>({});
  const { chartsData, loading: dataLoading } = useSensorData({
    selectedTags,
    startDate,
    endDate,
    interval,
  });

  // Определяем доступные теги в зависимости от выбранного блока
  const availableTags = selectedBlockName ? blockTags : tagNames;

  const handleTagToggle = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  // Инициализация значений из URL при первой загрузке
  useEffect(() => {
    if (initialEdgeKey && !selectedEdgeKey) {
      setSelectedEdgeKey(initialEdgeKey);
    }
    if (initialBlockName && !selectedBlockName) {
      setSelectedBlockName(initialBlockName);
    }
  }, [initialEdgeKey, initialBlockName, selectedEdgeKey, selectedBlockName]);

  // Сбрасываем выбранные теги при смене блока
  useEffect(() => {
    if (selectedBlockName && blockTags.length > 0) {
      const validTags = selectedTags.filter(tag => blockTags.includes(tag));
      if (validTags.length !== selectedTags.length) {
        onTagsChange(validTags);
      }
    }
  }, [selectedBlockName, blockTags, selectedTags, onTagsChange]);

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
          allTags={availableTags}
          startDate={startDate}
          endDate={endDate}
          interval={interval}
          onToggleTag={handleTagToggle}
          onStartDate={onStartDateChange}
          onEndDate={onEndDateChange}
          onInterval={onIntervalChange}
          tagNameMap={getTagNameMap()}
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
          (dataLoading || tagsLoading || thresholdsLoading || edgesLoading || blocksLoading || blockTagsLoading) && (
            <Loader variant="inline" compact message="Загрузка данных..." />
          )
        )}
        {!dataLoading && !tagsLoading && !thresholdsLoading && !edgesLoading && !blocksLoading && !blockTagsLoading && selectedTags.length > 0 && (
          <>
            <div className="chart-header">
              <div className="chart-info">
                {selectedEdgeKey && selectedBlockName ? (
                  <>
                    Блок: {blocks.find(b => b.block_name === selectedBlockName)?.description || selectedBlockName} 
                    ({selectedTags.length} тегов)
                  </>
                ) : selectedEdgeKey ? (
                  <>
                    Буровая: {edges.find(e => e.key === selectedEdgeKey)?.name || selectedEdgeKey} 
                    ({selectedTags.length} тегов)
                  </>
                ) : (
                  <>Выбрано тегов: {selectedTags.length}</>
                )}
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
                    tagNameMap={getTagNameMap()}
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
