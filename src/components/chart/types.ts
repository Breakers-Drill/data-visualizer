export interface DataPoint {
  id: string;
  edgeId: number;
  tag: string;
  timestamp: string;
  value: number;
  tagsDataId: number | null;
}

export interface ChartProps {
  data: DataPoint[];
  upperLimit?: number;
  lowerLimit?: number;
  showXAxis?: boolean;
  height?: number;
  allChartsData?: { [tag: string]: DataPoint[] };
  tagName?: string;
  color?: string;
  globalVerticalLine?: {
    visible: boolean;
    x: number;
    timestamp: string | null;
  };
  setGlobalVerticalLine?: React.Dispatch<
    React.SetStateAction<{
      visible: boolean;
      x: number;
      timestamp: string | null;
    }>
  >;
  tagNameMap?: Record<string, string>;
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: DataPoint | null;
}

export interface ChartDimensions {
  width: number;
  height: number;
}

export interface ChartScales {
  x: (index: number) => number;
  y: (value: number) => number;
}

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
