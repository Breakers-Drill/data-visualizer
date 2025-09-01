export interface Edge {
  key: string; // Уникальный ключ edge (например, "d_123456")
  name: string | null; // Название edge (например, "Буровая 123")
}

export interface EdgeAttribute {
  id: number; // Уникальный идентификатор записи
  edge_key: string; // Ключ edge
  bypass_state: string | null; // Состояние байпасов
  drive_state: string | null; // Привода без аварии
  daily_maintenance: boolean | null; // Ежедневное ТО
  weekly_maintenance: boolean | null; // Еженедельное ТО
  monthly_maintenance: boolean | null; // Ежемесячное ТО
  semiannual_maintenance: boolean | null; // Полугодовое ТО
  annual_maintenance: boolean | null; // Годовое ТО
}

export interface EdgeWithAttributes extends Edge {
  attributes?: EdgeAttribute;
}
