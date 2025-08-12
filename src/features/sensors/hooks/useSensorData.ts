import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import mockData from "../../../mockData.json";
import type { DataPoint } from "../../../components/chart/types";

export interface UseSensorDataParams {
  selectedTags: string[];
  startDate: string;
  endDate: string;
  interval: string;
}

const getIntervalMs = (intervalString: string): number => {
  switch (intervalString) {
    case "1min":
      return 60 * 1000;
    case "5min":
      return 5 * 60 * 1000;
    case "10min":
      return 10 * 60 * 1000;
    case "30min":
      return 30 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
};

const filterDataByDateRange = (
  data: DataPoint[],
  startDateStr: string,
  endDateStr: string
): DataPoint[] => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  return data.filter((item) => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= start && itemDate <= end;
  });
};

const downsampleByInterval = (
  data: DataPoint[],
  interval: string
): DataPoint[] => {
  if (data.length <= 1) return data;
  const intervalMs = getIntervalMs(interval);
  const result = [data[0]];
  let lastIncluded = new Date(data[0].timestamp).getTime();
  for (let i = 1; i < data.length; i++) {
    const t = new Date(data[i].timestamp).getTime();
    if (t - lastIncluded >= intervalMs || i === data.length - 1) {
      result.push(data[i]);
      lastIncluded = t;
    }
  }
  return result;
};

export const useSensorData = ({
  selectedTags,
  startDate,
  endDate,
  interval,
}: UseSensorDataParams) => {
  const [chartsData, setChartsData] = useState<{ [tag: string]: DataPoint[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      const newChartsData: { [tag: string]: DataPoint[] } = {};
      for (const tag of selectedTags) {
        try {
          if (tag === "DC_out_100ms[148]") {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/sensor-data`,
              {
                tag,
                dateInterval: {
                  start: new Date(startDate).toISOString(),
                  end: new Date(endDate).toISOString(),
                },
                interval,
              }
            );
            const filtered = filterDataByDateRange(response.data, startDate, endDate);
            newChartsData[tag] = downsampleByInterval(filtered, interval);
          } else {
            const mockTagData = (mockData as any)[tag] as DataPoint[] | undefined;
            const filtered = mockTagData
              ? filterDataByDateRange(mockTagData, startDate, endDate)
              : [];
            newChartsData[tag] = downsampleByInterval(filtered, interval);
          }
        } catch (e: any) {
          console.error(`Ошибка загрузки данных для тега ${tag}:`, e);
          newChartsData[tag] = [];
          if (!error) setError(e?.message ?? "Ошибка загрузки данных");
        }
      }
      if (!canceled) setChartsData(newChartsData);
      if (!canceled) setLoading(false);
    };
    run();
    return () => {
      canceled = true;
    };
  }, [selectedTags, startDate, endDate, interval]);

  const sortedChartsData = useMemo(() => {
    const entries = Object.entries(chartsData).map(([tag, arr]) => [
      tag,
      [...arr].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    ] as const);
    return Object.fromEntries(entries) as { [tag: string]: DataPoint[] };
  }, [chartsData]);

  return { chartsData: sortedChartsData, loading, error };
};


