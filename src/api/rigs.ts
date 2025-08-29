// import { apiClient } from './client'
import type { Rig } from "../types/rig";

// Временные моковые данные до создания API для ригов
const mockRigs: Rig[] = [
  {
    id: "14815",
    name: "БУ №14815", 
    ok: true,
    sensors: [
      { id: "BU14815_AC[001]", baseTag: "AC_voltage_sensor[001]", name: "Напряжение AC", ok: true, blockId: "1" },
      { id: "BU14815_TEMP[045]", baseTag: "Temperature_sensor[045]", name: "Температура", ok: true, blockId: "2" },
      { id: "BU14815_PRESS[123]", baseTag: "Pressure_sensor[123]", name: "Давление", ok: true, blockId: "2" },
      { id: "BU14815_FLOW[078]", baseTag: "Flow_rate[078]", name: "Расход", ok: true, blockId: "3" }
    ]
  },
  {
    id: "14816",
    name: "БУ №14816",
    ok: true,
    sensors: [
      { id: "BU14816_AC[001]", baseTag: "AC_voltage_sensor[001]", name: "Напряжение AC", ok: true, blockId: "1" },
      { id: "BU14816_TEMP[045]", baseTag: "Temperature_sensor[045]", name: "Температура", ok: true, blockId: "2" },
      { id: "BU14816_VIBR[099]", baseTag: "Vibration_sensor[099]", name: "Вибрация", ok: true, blockId: "4" }
    ]
  },
  {
    id: "14817",
    name: "БУ №14817",
    ok: false,
    sensors: [
      { id: "BU14817_DC[148]", baseTag: "DC_out_100ms[148]", name: "Постоянный ток", ok: false, blockId: "4" },
      { id: "BU14817_TEMP[045]", baseTag: "Temperature_sensor[045]", name: "Температура", ok: true, blockId: "2" }
    ]
  }
]

export async function getRigs(): Promise<Rig[]> {
  // TODO: Заменить на реальный API когда будет готов endpoint для ригов
  return mockRigs;
}

export async function getRigById(id: string): Promise<Rig | undefined> {
  const all = await getRigs();
  return all.find((r) => r.id === id);
}


