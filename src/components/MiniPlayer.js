import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';

const MiniPlayer = () => {
    const { currentTrack } = usePlayerStore();
    const playbackState = usePlaybackState();
    const navigation = useNavigation();

    if (!currentTrack) return null;

    const togglePlayback = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };

    const openPlayer = () => {
        navigation.navigate('Player');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={openPlayer} activeOpacity={0.9}>
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
            </View>
            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                <Text style={styles.playButtonText}>
                    {playbackState.state === State.Playing ? '||' : '▶'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#222',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    artist: {
        color: '#BBB',
        fontSize: 12,
    },
    playButton: {
        padding: 10,
    },
    playButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default MiniPlayer;
