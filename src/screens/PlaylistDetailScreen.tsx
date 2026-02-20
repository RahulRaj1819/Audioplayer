import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TrackPlayer, { Track } from 'react-native-track-player';
import {
  getSongsInPlaylist,
  getPlaylists,
  createPlaylist,
  removeSongFromPlaylist,
} from '../database/db';
import { usePlayerStore } from '../store/usePlayerStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RootStackParamList, 'PlaylistDetail'>;
type NavProp = StackNavigationProp<RootStackParamList, 'PlaylistDetail'>;

interface Song {
  id: number;
  uri: string;
  title: string;
  artist: string;
  duration: number;
  album: string;
}

interface SubPlaylist {
  id: number;
  name: string;
  parent_id: number | null;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlaylistDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { playlistId, playlistName } = route.params;
  const [songs, setSongs] = useState<Song[]>([]);
  const [subPlaylists, setSubPlaylists] = useState<SubPlaylist[]>([]);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [subName, setSubName] = useState('');
  const { setQueue } = usePlayerStore();

  const load = useCallback(() => {
    setSongs(getSongsInPlaylist(playlistId));
    setSubPlaylists(getPlaylists(playlistId));
  }, [playlistId]);

  useEffect(() => {
    navigation.setOptions({ title: playlistName });
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, playlistName, load]);

  const createSub = useCallback(() => {
    const trimmed = subName.trim();
    if (!trimmed) return;
    createPlaylist(trimmed, playlistId);
    setSubName('');
    setSubModalVisible(false);
    load();
  }, [subName, playlistId, load]);

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

  const removeSong = useCallback(
    (songId: number, title: string) => {
      Alert.alert('Remove Song', `Remove "${title}" from this playlist?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeSongFromPlaylist(playlistId, songId);
            load();
          },
        },
      ]);
    },
    [playlistId, load]
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('SongPicker', { playlistId, playlistName })
          }
        >
          <Text style={styles.actionBtnText}>+ Add Songs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setSubModalVisible(true)}
        >
          <Text style={styles.actionBtnText}>+ Sub-playlist</Text>
        </TouchableOpacity>
      </View>

      {subPlaylists.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Sub-playlists</Text>
          {subPlaylists.map((sp) => (
            <TouchableOpacity
              key={sp.id}
              style={styles.subItem}
              onPress={() =>
                navigation.navigate('PlaylistDetail', {
                  playlistId: sp.id,
                  playlistName: sp.name,
                })
              }
            >
              <Text style={styles.subItemText}>♫ {sp.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.sectionLabel}>Songs ({songs.length})</Text>
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No songs in this playlist.</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.songItem}
              onPress={() => playSong(index)}
              onLongPress={() => removeSong(item.id, item.title || 'Unknown')}
            >
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {item.title || 'Unknown'}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {item.artist || 'Unknown Artist'}
                </Text>
              </View>
              <Text style={styles.songDuration}>
                {formatDuration(item.duration)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={subModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Sub-playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#888"
              value={subName}
              onChangeText={setSubName}
              autoFocus
              onSubmitEditing={createSub}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => { setSubModalVisible(false); setSubName(''); }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createSub} style={styles.createBtn}>
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  actionBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  sectionLabel: {
    color: '#B3B3B3',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
    letterSpacing: 0.8,
  },
  subItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  subItemText: { color: '#1DB954', fontSize: 15 },
  list: { paddingBottom: 80 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  songInfo: { flex: 1, marginRight: 8 },
  songTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  songArtist: { color: '#B3B3B3', fontSize: 13, marginTop: 2 },
  songDuration: { color: '#B3B3B3', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#B3B3B3', fontSize: 15 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelBtnText: { color: '#B3B3B3', fontSize: 15 },
  createBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});
