export const formatTimeHHMM = (date: Date): string =>
  date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });


