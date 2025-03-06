import useSWR from 'swr';
import { getInventoryItems } from '@/lib/actions/inventory';
import { InventoryItem } from '@/db/schema';

// Define the fetcher function
const fetcher = async (url: string, category?: string, search?: string): Promise<InventoryItem[]> => {
  if (url === '/api/inventory') {
    return getInventoryItems(category, search);
  }
  return [];
};

export function useInventory(category?: string, search?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/inventory', category, search],
    ([url, category, search]) => fetcher(url, category, search),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    items: data || [],
    isLoading,
    isError: error,
    mutate, // This function allows us to manually revalidate the data
  };
} 