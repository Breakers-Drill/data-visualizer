import { useState, useEffect } from 'react';
import { getEdgeBlocks, getTagsForBlock } from '../api/blocks';
import type { EdgeBlock } from '../types/block';

export function useEdgeBlocks(edgeKey: string | null) {
  const [blocks, setBlocks] = useState<EdgeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!edgeKey) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    const fetchBlocks = async () => {
      try {
        setLoading(true);
        setError(null);
        const blocksData = await getEdgeBlocks({ edge_key: edgeKey });
        
        setBlocks(blocksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке блоков');
        
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [edgeKey]);

  return { blocks, loading, error };
}

export function useBlockTags(edgeKey: string | null, blockName: string | null) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!edgeKey || !blockName) {
      setTags([]);
      setLoading(false);
      return;
    }

    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const tagNames = await getTagsForBlock(edgeKey, blockName);
        
        setTags(tagNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке тегов блока');
        
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [edgeKey, blockName]);

  return { tags, loading, error };
}
