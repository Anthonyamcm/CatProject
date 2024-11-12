import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './Client';
import { Alert } from 'react-native';

export interface Vote {
  id: number;
  image_id: string;
  value: number;
}

// Add vote
interface AddVoteVariables {
  imageId: string;
  value: number;
}

// Fetch votes
const fetchVotes = async (): Promise<Vote[]> => {
  const response = await apiClient.get<Vote[]>('/votes');
  return response.data;
};

export const useVotes = () => {
  return useQuery<Vote[], Error>({
    queryKey: ['votes'],
    queryFn: fetchVotes,
  });
};

export const useAddVote = () => {
  const queryClient = useQueryClient();

  return useMutation<Vote, Error, AddVoteVariables>({
    mutationFn: async ({ imageId, value }) => {
      const response = await apiClient.post<Vote>('/votes', {
        image_id: imageId,
        value,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
    onError: (error: any) => {
      if (error.response) {
        console.error('Error adding vote:', error.response.data);
        Alert.alert('Vote Failed', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Upload Failed', 'No response from server.');
      } else {
        console.error('Error', error.message);
        Alert.alert('Vote Failed', error.message);
      }
    },
  });
};
