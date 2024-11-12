import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useImages, CatImage } from '../api/images';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from '../api/favorites';
import { useVotes, useAddVote } from '../api/votes';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Importing Icon Libraries

const HomeScreen: React.FC = () => {
  const router = useRouter();

  // Custom hooks
  const { data: images, isLoading, isError, error } = useImages();
  const {
    data: favorites,
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
    error: favoritesError,
  } = useFavorites();
  const {
    data: votes,
    isLoading: isVotesLoading,
    isError: isVotesError,
    error: votesError,
  } = useVotes();

  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  const addVoteMutation = useAddVote();

  // Helper functions
  const isFavorite = useCallback(
    (imageId: string): boolean => {
      return favorites?.some((fav) => fav.image_id === imageId) || false;
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    (imageId: string) => {
      const fav = favorites?.find((fav) => fav.image_id === imageId);
      if (fav) {
        removeFavoriteMutation.mutate(fav.id);
      } else {
        addFavoriteMutation.mutate(imageId);
      }
    },
    [favorites, removeFavoriteMutation, addFavoriteMutation],
  );

  const voteCat = useCallback(
    (imageId: string, value: number) => {
      addVoteMutation.mutate({ imageId, value });
    },
    [addFavoriteMutation],
  );

  const getScore = useCallback(
    (imageId: string): number => {
      return (
        votes
          ?.filter((vote) => vote.image_id === imageId)
          .reduce((total, vote) => total + (vote.value === 1 ? 1 : -1), 0) || 0
      );
    },
    [votes],
  );

  // Render functions
  const renderItem: ListRenderItem<CatImage> = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Image source={{ uri: item.url }} style={styles.image} />
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
            size={24}
            color="#e91e63"
          />
        </TouchableOpacity>
        <View style={styles.voteContainer}>
          <TouchableOpacity
            onPress={() => voteCat(item.id, 1)}
            style={styles.voteButton}
          >
            <Ionicons name="arrow-up" size={20} color="#4caf50" />
            <Text style={styles.voteText}>Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => voteCat(item.id, 0)}
            style={styles.voteButton}
          >
            <Ionicons name="arrow-down" size={20} color="#f44336" />
            <Text style={styles.voteText}>Down</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.scoreText}>Score: {getScore(item.id)}</Text>
      </View>
    ),
    [toggleFavorite, isFavorite, voteCat, getScore],
  );

  if (isLoading || isFavoritesLoading || isVotesLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError || isFavoritesError || isVotesError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: {(error || favoritesError || votesError)?.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={21}
        removeClippedSubviews={true}
      />
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router.push('/upload')}
      >
        <MaterialIcons name="add-a-photo" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.1, // iOS shadow
    shadowRadius: 5, // iOS shadow
    width: Dimensions.get('window').width / 2 - 10, // width / num col - 10
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 5,
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  voteText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  scoreText: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    color: '#555',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2196f3',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 5, // iOS shadow
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
  },
});
