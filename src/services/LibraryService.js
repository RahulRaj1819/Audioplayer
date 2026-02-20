import * as MediaLibrary from 'expo-media-library';
import { insertSongs, getAllSongs } from './DatabaseService';

export const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
};

export const scanFiles = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return [];

    const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 999999, // Fetch all
    });

    const formattedSongs = media.assets.map((asset) => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ""), // Fallback title
        artist: 'Unknown Artist', // MediaLibrary doesn't always return metadata, might need another lib specifically for metadata if needed
        album: 'Unknown Album',
        duration: asset.duration,
        url: asset.uri,
        artwork: null, // Need custom logic to extract artwork
    }));

    // Save to DB
    await insertSongs(formattedSongs);
    return formattedSongs;
};

export const loadLibrary = async () => {
    return await getAllSongs();
};
