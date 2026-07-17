import { useCallback, useEffect, useState } from "react";

type ListResponse<TItem> = {
  success: boolean;
  data: TItem[];
};

type UseListLoaderOptions<TItem> = {
  load: () => Promise<ListResponse<TItem>>;
  unableToLoadMessage: string;
  emptyListMessage: string;
  initialError?: string;
  resetListOnLoad?: boolean;
};

type UseListLoaderResult<TItem> = {
  list: TItem[];
  isLoading: boolean;
  listError: string;
  reloadList: () => Promise<void>;
};

function useListLoader<TItem>({
  load,
  unableToLoadMessage,
  emptyListMessage,
  initialError = "",
  resetListOnLoad = true,
}: UseListLoaderOptions<TItem>): UseListLoaderResult<TItem> {
  const [list, setList] = useState<TItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>(initialError);

  const reloadList = useCallback(async () => {
    if (resetListOnLoad) {
      setList([]);
    }

    setIsLoading(true);
    setListError("");

    try {
      const { success, data } = await load();

      setList(data);

      if (!success) {
        setListError(unableToLoadMessage);

        return;
      }

      if (data.length === 0) {
        setListError(emptyListMessage);
      }
    } catch {
      setList([]);
      setListError(unableToLoadMessage);
    } finally {
      setIsLoading(false);
    }
  }, [emptyListMessage, load, resetListOnLoad, unableToLoadMessage]);

  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  return {
    list,
    isLoading,
    listError,
    reloadList,
  };
}

export { useListLoader };
