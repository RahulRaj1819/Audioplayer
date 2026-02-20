import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAllSongs, getSongsInPlaylist, addSongToPlaylist } from '../database/db';
import { RootStackParamList } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RootStackParamList, 'SongPicker'>;
type NavProp = StackNavigationProp<RootStackParamList, 'SongPicker'>;

interface Song {
  id: number;
  uri: string;
  title: string;
  artist: string;
  duration: number;
  album: string;
}

export default function SongPickerScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { playlistId } = route.params;

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [existingIds, setExistingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setAllSongs(getAllSongs());
    const existing = getSongsInPlaylist(playlistId);
    setExistingIds(new Set(existing.map((s) => s.id)));
  }, [playlistId]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    selectedIds.forEach((id) => addSongToPlaylist(playlistId, id));
    navigation.goBack();
  }, [selectedIds, playlistId, navigation]);

  const renderItem = ({ item }: { item: Song }) => {
    const alreadyIn = existingIds.has(item.id);
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.item, alreadyIn && styles.itemDisabled]}
        onPress={() => !alreadyIn && toggleSelect(item.id)}
        disabled={alreadyIn}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.songInfo}>
          <Text
            style={[styles.title, alreadyIn && styles.titleDisabled]}
            numberOfLines={1}
          >
            {item.title || 'Unknown'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {item.artist || 'Unknown Artist'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Add Songs ({selectedIds.size} selected)
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, selectedIds.size === 0 && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={selectedIds.size === 0}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {allSongs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No songs in library.</Text>
        </View>
      ) : (
        <FlatList
          data={allSongs}
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
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  list: { paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  itemDisabled: { opacity: 0.4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#535353',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  checkmark: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  songInfo: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  titleDisabled: { color: '#B3B3B3' },
  artist: { color: '#B3B3B3', fontSize: 13, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#B3B3B3', fontSize: 15 },
});
