import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SeparateChartsPage from "./SeparateChartsPage";
import CombinedChartPage from "./CombinedChartPage";

export default function ChartsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialMode = (params.get("mode") || (location.pathname.endsWith("/separate") ? "separate" : "combined")) as "separate" | "combined" | "single";
  const [mode, setMode] = useState<"separate" | "combined" | "single">(initialMode);

  // Получаем параметры из URL
  const rigParam = params.get("rig");
  const blockParam = params.get("block");
  const selectedEdgeKey = rigParam ? `d_${rigParam}` : null;

  // Состояние для тегов, времени и интервала
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("2025-08-01T17:30:00");
  const [endDate, setEndDate] = useState<string>("2025-08-02T19:34:00");
  const [interval, setInterval] = useState<string>("1min");

  const setModeAndUrl = (m: "separate" | "combined" | "single") => {
    setMode(m);
    const next = new URLSearchParams(location.search);
    next.set("mode", m);
    navigate({ pathname: location.pathname, search: `?${next.toString()}` }, { replace: true });
  };

  return (
    <div>
      {mode === "combined" || mode === "single" ? (
        <CombinedChartPage 
          mode={mode} 
          onChangeMode={setModeAndUrl}
          selectedTags={selectedTags}
          startDate={startDate}
          endDate={endDate}
          interval={interval}
          onTagsChange={setSelectedTags}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onIntervalChange={setInterval}
          initialEdgeKey={selectedEdgeKey}
          initialBlockName={blockParam}
        />
      ) : (
        <SeparateChartsPage 
          mode={mode} 
          onChangeMode={setModeAndUrl}
          selectedTags={selectedTags}
          startDate={startDate}
          endDate={endDate}
          interval={interval}
          onTagsChange={setSelectedTags}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onIntervalChange={setInterval}
          initialEdgeKey={selectedEdgeKey}
          initialBlockName={blockParam}
        />
      )}
    </div>
  );
}
