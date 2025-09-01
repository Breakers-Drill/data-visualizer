import { apiClient } from './client';
import type { EdgeBlock, BlockTag } from '../types/block';

export interface EdgeBlocksGetRequest {
  edge_key?: string;
  block_name?: string;
}

export interface BlockTagsGetRequest {
  tag?: string;
  edge_key?: string;
  block_name?: string;
}

export async function getEdgeBlocks(params: EdgeBlocksGetRequest = {}): Promise<EdgeBlock[]> {
  const response = await apiClient.get<EdgeBlock[]>('/edge-blocks', { params });
  return response.data;
}

export async function getBlockTags(params: BlockTagsGetRequest = {}): Promise<BlockTag[]> {
  const response = await apiClient.get<BlockTag[]>('/block-tags', { params });
  return response.data;
}

// Получить теги для конкретного блока
export async function getTagsForBlock(edge_key: string, block_name: string): Promise<string[]> {
  try {
    const blockTags = await getBlockTags({ edge_key, block_name });
    return blockTags.map(bt => bt.tag);
  } catch {
    return [];
  }
}
