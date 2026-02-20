import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { scanFiles, loadLibrary, requestPermissions } from '../services/LibraryService';
import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from '../store/usePlayerStore';

const LibraryScreen = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setCurrentTrack, setQueue } = usePlayerStore();

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        setLoading(true);
        const hasPermission = await requestPermissions();
        if (hasPermission) {
            // First try to load from DB
            let loadedSongs = await loadLibrary();

            // If DB is empty, scan (or maybe always scan on startup? Task says [2.1] Auto-scan ... on launch)
            if (loadedSongs.length === 0) {
                loadedSongs = await scanFiles();
            }
            setSongs(loadedSongs);
        }
        setLoading(false);
    };

    const playSong = async (index) => {
        const track = songs[index];
        // Setup queue
        await TrackPlayer.reset();
        await TrackPlayer.add(songs);
        await TrackPlayer.skip(index);
        await TrackPlayer.play();

        setCurrentTrack(track);
        setQueue(songs);
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.songItem} onPress={() => playSong(index)}>
            <View style={styles.artworkPlaceholder}>
                <Text style={styles.artworkText}>♪</Text>
            </View>
            <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </TouchableOpacity>
    );

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#BB86FC" />
                <Text style={{ color: '#FFF', marginTop: 10 }}>Scanning Library...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={songs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    listContent: {
        padding: 10,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    artworkPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    artworkText: {
        color: '#BB86FC',
        fontSize: 24,
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    songArtist: {
        color: '#BBB',
        fontSize: 14,
    },
    duration: {
        color: '#777',
        fontSize: 12,
    },
});

export default LibraryScreen;
