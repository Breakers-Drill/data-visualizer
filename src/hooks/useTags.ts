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

  // Получить человекочитаемое название тега
  const getTagDisplayName = (tagName: string): string => {
    const tag = tags.find(t => t.tag === tagName);
    return tag?.name || tagName;
  };

  // Получить карту технических названий к человекочитаемым
  const getTagNameMap = (): Record<string, string> => {
    const nameMap: Record<string, string> = {};
    tags.forEach(tag => {
      nameMap[tag.tag] = tag.name;
    });
    return nameMap;
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
    getTagDisplayName,
    getTagNameMap,
    loading,
    error,
    refetch
  };
};
