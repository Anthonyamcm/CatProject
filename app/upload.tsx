import React, { useCallback, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useUploadImage } from '../api/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Importing Icon Libraries

const windowWidth = Dimensions.get('window').width;

const UploadScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const uploadImageMutation = useUploadImage();

  const pickImage = useCallback(async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access camera roll is required!',
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const uploadImage = useCallback(() => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image to upload.');
      return;
    }

    const formData = new FormData();

    formData.append('file', {
      uri: selectedImage,
      name: 'cat.jpg',
      type: 'image/jpeg',
    } as Blob & { uri: string; name: string; type: string });

    uploadImageMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.approved) {
          Alert.alert('Success', 'Image uploaded successfully!', [
            {
              text: 'OK',
              onPress: () => router.push('/'),
            },
          ]);
        } else {
          Alert.alert('Upload Failed', 'The image could not be uploaded.');
        }
      },
    });
  }, [selectedImage, uploadImageMutation, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Upload Status */}
        {uploadImageMutation.isError && (
          <Text style={styles.errorText}>
            Error: {uploadImageMutation.error?.message || 'Unknown error'}
          </Text>
        )}

        {/* Pick Image Button */}
        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Ionicons name="images-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        {/* Display Selected Image */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Upload Image Button */}
        {selectedImage && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadImage}
            disabled={uploadImageMutation.isPending}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Upload Image</Text>
            {uploadImageMutation.isPending && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.activityIndicator}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'flex-start',
  },
  pickButton: {
    flexDirection: 'row',
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 30,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 3, // iOS shadow
    width: windowWidth - 40,
    height: windowWidth - 40,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: '#f44336',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  activityIndicator: {
    paddingHorizontal: 6,
  },
});
