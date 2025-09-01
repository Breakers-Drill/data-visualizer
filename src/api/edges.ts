import { apiClient } from './client';
import type { Edge, EdgeAttribute } from '../types/edge';

export interface EdgeGetRequest {
  key?: string;
  name?: string;
}

export interface EdgeAttributesGetRequest {
  edge_key?: string;
  bypass_state?: string;
}

export async function getEdges(params: EdgeGetRequest = {}): Promise<Edge[]> {
  const response = await apiClient.get<Edge[]>('/edges', { params });
  return response.data;
}

export async function getEdgeAttributes(params: EdgeAttributesGetRequest = {}): Promise<EdgeAttribute[]> {
  const response = await apiClient.get<EdgeAttribute[]>('/edge-attributes', { params });
  return response.data;
}

export async function getEdgeWithAttributes(edgeKey: string): Promise<EdgeAttribute | null> {
  try {
    const attributes = await getEdgeAttributes({ edge_key: edgeKey });
    return attributes.length > 0 ? attributes[0] : null;
  } catch {
    return null;
  }
}
