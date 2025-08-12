export const basePalette: string[] = [
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#9467bd", // purple
  "#8c564b", // brown
  "#e377c2", // pink
  "#7f7f7f", // gray
  "#bcbd22", // olive
  "#17becf", // cyan
];

export const getColorByIndex = (index: number): string => {
  return basePalette[index % basePalette.length];
};


