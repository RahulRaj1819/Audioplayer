import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAllSongs, upsertSong } from '../database/db';
import { usePlayerStore } from '../store/usePlayerStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import TrackPlayer, { Track } from 'react-native-track-player';

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Song {
  id: number;
  uri: string;
  title: string;
  artist: string;
  duration: number;
  album: string;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MediaAsset {
  uri: string;
  filename: string;
  duration: number;
  artist?: string;
  album?: string;
}

export default function LibraryScreen() {
  const navigation = useNavigation<NavProp>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [scanning, setScanning] = useState(false);
  const { setQueue } = usePlayerStore();

  const loadSongs = useCallback(() => {
    setSongs(getAllSongs());
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const scanLibrary = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot access media library.');
      return;
    }
    setScanning(true);
    try {
      let after: string | undefined;
      let hasNextPage = true;
      while (hasNextPage) {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 200,
          after,
        });
        for (const asset of result.assets) {
          const typedAsset = asset as unknown as MediaAsset;
          upsertSong({
            uri: typedAsset.uri,
            title: typedAsset.filename.replace(/\.[^/.]+$/, '') || 'Unknown',
            artist: typedAsset.artist || 'Unknown Artist',
            duration: typedAsset.duration,
            album: typedAsset.album || 'Unknown Album',
          });
        }
        hasNextPage = result.hasNextPage;
        after = result.endCursor;
      }
      loadSongs();
    } finally {
      setScanning(false);
    }
  }, [loadSongs]);

  const playSong = useCallback(
    async (index: number) => {
      const tracks: Track[] = songs.map((s) => ({
        id: String(s.id),
        url: s.uri,
        title: s.title || 'Unknown',
        artist: s.artist || 'Unknown Artist',
        album: s.album || '',
        duration: s.duration,
      }));
      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      setQueue(tracks, index);
      navigation.navigate('Player');
    },
    [songs, setQueue, navigation]
  );

  const renderItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity style={styles.item} onPress={() => playSong(index)}>
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || 'Unknown'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.artist || 'Unknown Artist'}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={scanLibrary}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#1DB954" size="small" />
          ) : (
            <Text style={styles.scanButtonText}>Scan</Text>
          )}
        </TouchableOpacity>
      </View>
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No songs found.</Text>
          <Text style={styles.emptyHint}>Tap "Scan" to import audio files.</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  scanButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
  },
  scanButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  list: { paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  itemInfo: { flex: 1, marginRight: 8 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  subtitle: { color: '#B3B3B3', fontSize: 13, marginTop: 2 },
  duration: { color: '#B3B3B3', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFFFFF', fontSize: 18, marginBottom: 8 },
  emptyHint: { color: '#B3B3B3', fontSize: 14 },
});
