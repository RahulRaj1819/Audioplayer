import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getPlaylists, createPlaylist, deletePlaylist } from '../database/db';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Playlist {
  id: number;
  name: string;
  parent_id: number | null;
}

export default function PlaylistsScreen() {
  const navigation = useNavigation<NavProp>();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const loadPlaylists = useCallback(() => {
    setPlaylists(getPlaylists());
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPlaylists);
    return unsubscribe;
  }, [navigation, loadPlaylists]);

  const handleCreate = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createPlaylist(trimmed);
    setNewName('');
    setModalVisible(false);
    loadPlaylists();
  }, [newName, loadPlaylists]);

  const handleDelete = useCallback(
    (id: number, name: string) => {
      Alert.alert('Delete Playlist', `Delete "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlaylist(id);
            loadPlaylists();
          },
        },
      ]);
    },
    [loadPlaylists]
  );

  const renderItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistName: item.name })}
      onLongPress={() => handleDelete(item.id, item.name)}
    >
      <View style={styles.playlistIcon}>
        <Text style={styles.playlistIconText}>♫</Text>
      </View>
      <Text style={styles.itemText} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No playlists yet.</Text>
          <Text style={styles.emptyHint}>Tap "+ New" to create one.</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist name"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setNewName(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
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
  addButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  list: { paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistIconText: { color: '#1DB954', fontSize: 20 },
  itemText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFFFFF', fontSize: 18, marginBottom: 8 },
  emptyHint: { color: '#B3B3B3', fontSize: 14 },
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
