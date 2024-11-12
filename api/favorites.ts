import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './Client';
import { Alert } from 'react-native';

export interface Favorite {
  id: number;
  image_id: string;
}

// Fetch favorites
const fetchFavorites = async (): Promise<Favorite[]> => {
  const response = await apiClient.get<Favorite[]>('/favourites');
  return response.data;
};

export const useFavorites = () => {
  return useQuery<Favorite[], Error>({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });
};

// Add favorite
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<Favorite, Error, string>({
    mutationFn: async (imageId: string) => {
      const response = await apiClient.post<Favorite>('/favourites', {
        image_id: imageId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      if (error.response) {
        console.error('Error adding favorite:', error.response.data);
        Alert.alert('Favorite Failed', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Favorite Failed', 'No response from server.');
      } else {
        console.error('Error', error.message);
        Alert.alert('Favorite Failed', error.message);
      }
    },
  });
};

// Remove favorite
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (favoriteId: number) => {
      await apiClient.delete(`/favourites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      if (error.response) {
        console.error('Error removing favorite:', error.response.data);
        Alert.alert('Favorite Failed', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Favorite Failed', 'No response from server.');
      } else {
        console.error('Error', error.message);
        Alert.alert('Favorite Failed', error.message);
      }
    },
  });
};
