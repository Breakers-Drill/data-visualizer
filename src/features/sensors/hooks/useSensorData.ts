import { useEffect, useState } from "react";
import { tagsApi } from "../../../api/tags";
import type { DataPoint } from "../../../components/chart/types";

export interface UseSensorDataParams {
  selectedTags: string[];
  startDate: string;
  endDate: string;
  interval: string;
}

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
          // Проверяем, является ли тег типа dc_out_300ms[0-59]
          // const isDcOut300msTag = /^dc_out_300ms\[\d+\]$/.test(tag);
          
          let sensorData;
          
          // if (isDcOut300msTag) {
          //   // Для тегов dc_out_300ms используем моковые данные
          //   sensorData = await tagsApi.getMockDcOut300msData();
          //   // Фильтруем данные только для конкретного тега
          //   sensorData = sensorData.filter(item => item.tag === tag);
          // } else {
            // Для остальных тегов получаем данные с backend API
            sensorData = await tagsApi.getSensorData({
              tag,
              dateInterval: {
                start: new Date(startDate),
                end: new Date(endDate)
              },
              interval
            });
          // }
          
          // Преобразуем данные в формат DataPoint
          const dataPoints: DataPoint[] = sensorData.map(item => ({
            id: item.id,
            edgeId: item.edgeId,
            tag: item.tag,
            timestamp: item.timestamp,
            value: item.value,
            tagsDataId: item.tagsDataId
          }));
          
          const sorted = [...dataPoints].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          newChartsData[tag] = sorted;
        } catch (e: unknown) {
          newChartsData[tag] = [];
          if (!canceled) {
            const message = e instanceof Error ? e.message : "Ошибка загрузки данных";
            setError((prev) => prev ?? message);
          }
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

  return { chartsData, loading, error };
};


