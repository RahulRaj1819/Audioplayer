import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { getPlaylists, createPlaylist, getPlaylistSongs, deletePlaylist } from '../services/DatabaseService';
import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from '../store/usePlayerStore';
import { useFocusEffect } from '@react-navigation/native';

const PlaylistScreen = ({ navigation, route }) => {
    const parentId = route.params?.parentId || null;
    const playlistName = route.params?.playlistName || 'Playlists';

    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const { setCurrentTrack, setQueue } = usePlayerStore();

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [parentId])
    );

    const loadData = async () => {
        const loadedPlaylists = await getPlaylists(parentId);
        setPlaylists(loadedPlaylists);

        if (parentId) {
            const loadedSongs = await getPlaylistSongs(parentId);
            setSongs(loadedSongs);
        } else {
            setSongs([]);
        }

        navigation.setOptions({ headerTitle: playlistName });
    };

    const handleCreatePlaylist = async () => {
        if (newPlaylistName.trim()) {
            await createPlaylist(newPlaylistName, parentId);
            setNewPlaylistName('');
            setShowCreateModal(false);
            loadData();
        }
    };

    const handlePlaylistPress = (item) => {
        navigation.push('PlaylistView', { parentId: item.id, playlistName: item.name });
    };

    const playSong = async (index) => {
        const track = songs[index];
        await TrackPlayer.reset();
        await TrackPlayer.add(songs);
        await TrackPlayer.skip(index);
        await TrackPlayer.play();

        setCurrentTrack(track);
        setQueue(songs);
    };

    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity style={styles.playlistItem} onPress={() => handlePlaylistPress(item)}>
            <View style={styles.folderIcon}>
                <Text style={{ fontSize: 24 }}>📁</Text>
            </View>
            <Text style={styles.itemTitle}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderSongItem = ({ item, index }) => (
        <TouchableOpacity style={styles.songItem} onPress={() => playSong(index)}>
            <View style={styles.musicIcon}>
                <Text style={{ fontSize: 20 }}>🎵</Text>
            </View>
            <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.artist}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{playlistName}</Text>
                <View style={{ flexDirection: 'row' }}>
                    {parentId && (
                        <TouchableOpacity onPress={() => navigation.navigate('SongPicker', { playlistId: parentId })} style={[styles.addButton, { marginRight: 10 }]}>
                            <Text style={styles.addButtonText}>+ Songs</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Folder</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={[...playlists, ...songs]}
                renderItem={({ item, index }) => {
                    if (item.parent_id !== undefined || (item.parent_id === undefined && item.url === undefined)) {
                        // It's a playlist (checked by existence of parent_id property or lack of url)
                        // Actually database returns parent_id for playlists. Songs don't have parent_id.
                        // Robust check: if 'name' exists and 'title' doesn't, it is a playlist? 
                        // DatabaseService: playlists have 'name', songs have 'title'.
                        return item.name ? renderPlaylistItem({ item }) : renderSongItem({ item, index: index - playlists.length });
                    }
                    return null;
                }}
                keyExtractor={(item) => item.id.toString() + (item.title ? '_song' : '_pl')}
                contentContainerStyle={styles.listContent}
            />

            <Modal visible={showCreateModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Playlist</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Playlist Name"
                            placeholderTextColor="#777"
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.cancelButton}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreatePlaylist} style={styles.createButton}>
                                <Text style={styles.buttonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#BB86FC',
    },
    listContent: {
        padding: 10,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    folderIcon: {
        marginRight: 15,
        width: 40,
        alignItems: 'center',
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        paddingLeft: 10,
    },
    musicIcon: {
        marginRight: 15,
        width: 40,
        alignItems: 'center',
    },
    itemTitle: {
        color: '#FFF',
        fontSize: 16,
    },
    itemSubtitle: {
        color: '#777',
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#222',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: 10,
        marginRight: 10,
    },
    createButton: {
        padding: 10,
        backgroundColor: '#BB86FC',
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default PlaylistScreen;
