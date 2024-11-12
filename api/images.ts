import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from '@tanstack/react-query';
import apiClient from './Client';
import { Alert } from 'react-native';

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface UploadResponse {
  id: string;
  url: string;
  approved: number;
  width: number;
  height: number;
}

// Fetch images
const fetchImages = async (): Promise<CatImage[]> => {
  const response = await apiClient.get<CatImage[]>('/images', {
    params: { limit: 100 },
  });
  return response.data;
};

export const useImages = () => {
  return useQuery<CatImage[], Error>({
    queryKey: ['images'],
    queryFn: fetchImages,
  });
};

// Upload image
export const useUploadImage = (): UseMutationResult<
  UploadResponse,
  Error,
  FormData
> => {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<UploadResponse>(
        '/images/upload',
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error: any) => {
      if (error.response) {
        console.error('Upload Error:', error.response.data);
        Alert.alert('Upload Failed', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Upload Failed', 'No response from server.');
      } else {
        console.error('Error', error.message);
        Alert.alert('Upload Failed', error.message);
      }
    },
  });
};
