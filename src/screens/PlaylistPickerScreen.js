import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getPlaylists, addSongToPlaylist, insertSongs, getAllSongs } from '../services/DatabaseService';

const PlaylistPickerScreen = ({ navigation, route }) => {
    const { song, sharedFile } = route.params || {}; // 'song' ID or 'sharedFile' object
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        // Flatten playlists? Or just show root?
        // For simplicity, let's just show all playlists (flattened if possible, or support navigation)
        // For now, let's just show root playlists or all recursively?
        // Implementing recursive picker is complex. Let's just show root folders and maybe 1 level deep?
        // Or just standard getPlaylists(null).
        // Given constraints, showing root is a good start.
        const loaded = await getPlaylists(null);
        setPlaylists(loaded);
    };

    const handleSelectPlaylist = async (playlist) => {
        try {
            let songId;
            if (sharedFile) {
                // Handle shared file: save to DB if new
                // Check if song exists or just insert
                // We need a robust way to generate ID. Using hash or filename?
                // MediaLibrary uses UUIDs.
                // Let's generate a temporary ID or use filename hash.
                const newId = 'shared_' + Date.now();
                const newSong = {
                    id: newId,
                    title: sharedFile.fileName || 'Shared Audio',
                    artist: 'Unknown',
                    album: 'Shared',
                    duration: 0, // Need to get duration
                    url: sharedFile.filePath,
                    artwork: null
                };
                await insertSongs([newSong]);
                songId = newSong.id;
            } else {
                songId = song.id;
            }

            await addSongToPlaylist(playlist.id, songId);
            Alert.alert("Success", `Added to ${playlist.name}`);
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to add song");
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => handleSelectPlaylist(item)}>
            <Text style={styles.itemTitle}>📁 {item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add to Playlist</Text>
            <FlatList
                data={playlists}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    itemTitle: {
        color: '#FFF',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    cancelText: {
        color: '#BB86FC',
    },
});

export default PlaylistPickerScreen;
