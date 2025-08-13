import { useEffect, useRef, useState } from "react";
import type { ChartDimensions } from "../types";

export const useChartDimensions = (height: number) => {
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 800,
    height,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [height]);

  return { dimensions, containerRef };
};
