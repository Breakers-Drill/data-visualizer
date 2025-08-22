import rigs from "../mocks/rigs.json";
import type { Rig } from "../types/rig";

export async function getRigs(): Promise<Rig[]> {
  return rigs as unknown as Rig[];
}

export async function getRigById(id: string): Promise<Rig | undefined> {
  const all = rigs as unknown as Rig[];
  return all.find((r) => r.id === id);
}


