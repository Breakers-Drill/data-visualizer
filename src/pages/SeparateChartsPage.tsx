import { useEffect, useState } from "react";
import "../App.css";
import Chart from "../components/chart/Chart";
import { getColorByIndex } from "../components/chart/utils/colors";
import Controls from "../features/sensors/components/Controls";
import { useSensorData } from "../features/sensors/hooks/useSensorData";
import { useTags } from "../hooks/useTags";
import { useThresholds } from "../hooks/useThresholds";
import { useEdges } from "../hooks/useEdges";
import { useEdgeBlocks, useBlockTags } from "../hooks/useBlocks";
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

  const [globalVerticalLine, setGlobalVerticalLine] = useState<{
    visible: boolean;
    x: number;
    timestamp: string | null;
  }>({ visible: false, x: 0, timestamp: null });

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
      // Оставляем только те теги, которые есть в текущем блоке
      const validTags = selectedTags.filter(tag => blockTags.includes(tag));
      if (validTags.length !== selectedTags.length) {
        onTagsChange(validTags);
      }
    }
  }, [selectedBlockName, blockTags, selectedTags, onTagsChange]);

  useEffect(() => {
    selectedTags.forEach((tag) => {
      setTagLimits((prev) => {
        if (!prev[tag]) {
          const limits = getLimitsForTag(tag);
          return { ...prev, [tag]: limits };
        }
        return prev;
      });
    });
  }, [selectedTags, getLimitsForTag]);

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
        ) : (dataLoading || tagsLoading || thresholdsLoading || edgesLoading || blocksLoading || blockTagsLoading) ? (
          <Loader variant="inline" compact message="Загрузка данных..." />
        ) : (
          <>
            <div className="chart-header">
              <div className="chart-info">
                {selectedEdgeKey && selectedBlockName ? (
                  <>
                    Блок: {blocks.find(b => b.block_name === selectedBlockName)?.description || selectedBlockName} 
                    ({selectedTags.length} графиков)
                  </>
                ) : selectedEdgeKey ? (
                  <>
                    Буровая: {edges.find(e => e.key === selectedEdgeKey)?.name || selectedEdgeKey} 
                    ({selectedTags.length} графиков)
                  </>
                ) : (
                  <>Выбрано графиков: {selectedTags.length}</>
                )}
              </div>
            </div>

            <div className="charts-container">
              {selectedTags.map((tag, index) => {
                const isLastChart = index === selectedTags.length - 1;
                const data = chartsData[tag] || [];
                const limits = tagLimits[tag] || getLimitsForTag(tag);
                const color = getColorByIndex(index);

                return (
                  <div key={tag} className="chart-wrapper">
                    <div className="chart-title-small">
                      {getTagNameMap()[tag] || tag} ({data.length} точек)
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
                      tagNameMap={getTagNameMap()}
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
