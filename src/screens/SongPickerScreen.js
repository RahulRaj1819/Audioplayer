import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAllSongs, addSongToPlaylist } from '../services/DatabaseService';

const SongPickerScreen = ({ navigation, route }) => {
    const { playlistId } = route.params;
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        setLoading(true);
        const allSongs = await getAllSongs();
        setSongs(allSongs);
        setLoading(false);
    };

    const toggleSelection = (id) => {
        const newSelection = new Set(selectedSongs);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedSongs(newSelection);
    };

    const handleAddSongs = async () => {
        setLoading(true);
        for (const songId of selectedSongs) {
            await addSongToPlaylist(playlistId, songId);
        }
        setLoading(false);
        navigation.goBack();
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedSongs.has(item.id);
        return (
            <TouchableOpacity style={[styles.songItem, isSelected && styles.selectedItem]} onPress={() => toggleSelection(item.id)}>
                <View style={styles.checkbox}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#BB86FC" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Songs</Text>
                <TouchableOpacity onPress={handleAddSongs} disabled={selectedSongs.size === 0}>
                    <Text style={[styles.headerButton, selectedSongs.size === 0 && styles.disabledButton]}>
                        Done ({selectedSongs.size})
                    </Text>
                </TouchableOpacity>
            </View>

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#1E1E1E',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        color: '#BB86FC',
        fontSize: 16,
    },
    disabledButton: {
        color: '#555',
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
    selectedItem: {
        backgroundColor: '#333',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#BB86FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        marginLeft: 5,
    },
    checkmark: {
        color: '#BB86FC',
        fontWeight: 'bold',
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
});

export default SongPickerScreen;
