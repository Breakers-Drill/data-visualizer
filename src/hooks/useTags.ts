import { useEffect, useState } from 'react';
import { tagsApi, type TagItem } from '../api/tags';

export const useTags = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tagsApi.getAllTags();
        setTags(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Ошибка загрузки тегов';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  // Получить список тегов как строки
  const getTagNames = (): string[] => {
    const tagNames = tags.map(tag => tag.tag);
    return tagNames;
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagsApi.getAllTags();
      setTags(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка загрузки тегов';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    tags,
    tagNames: getTagNames(),
    loading,
    error,
    refetch
  };
};
