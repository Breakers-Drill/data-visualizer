export interface RigSensorTag {
  id: string; // уникальный тег для данной вышки (псевдоним)
  baseTag: string; // базовый тег
  name: string; // человекочитаемое имя
  ok: boolean; // статус "зелёный/красный"
  blockId: string; // идентификатор блока на схеме (совпадает с id сегмента)
}

export interface Rig {
  id: string; // например "14820"
  name: string; // "БУ №14820"
  ok: boolean; // сводный статус вышки
  image?: string; // путь к изображению (опционально)
  sensors: RigSensorTag[]; // набор сенсоров
}


