import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/usePlayerStore';

const PlayerScreen = () => {
    const playbackState = usePlaybackState();
    const progress = useProgress();
    const { currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const [showSpeedModal, setShowSpeedModal] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    useEffect(() => {
        setIsPlaying(playbackState.state === State.Playing);
    }, [playbackState.state]);

    const togglePlayback = async () => {
        const currentTrack = await TrackPlayer.getActiveTrackIndex();
        if (currentTrack == null) {
            // TODO: Handle no track loaded
        } else {
            if (playbackState.state === State.Paused || playbackState.state === State.Ready || playbackState.state === State.Stopped) {
                await TrackPlayer.play();
            } else {
                await TrackPlayer.pause();
            }
        }
    };

    const skipToNext = async () => {
        await TrackPlayer.skipToNext();
    };

    const skipToPrevious = async () => {
        await TrackPlayer.skipToPrevious();
    };

    const handleSeek = (value) => {
        setSeekValue(value);
    };

    const handleSlidingStart = () => {
        setIsSeeking(true);
    };

    const handleSlidingComplete = async (value) => {
        await TrackPlayer.seekTo(value);
        setIsSeeking(false);
    };

    const changeSpeed = async (speed) => {
        await TrackPlayer.setRate(speed);
        setPlaybackSpeed(speed);
        setShowSpeedModal(false);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

    return (
        <View style={styles.container}>
            <View style={styles.artworkContainer}>
                <View style={styles.artworkPlaceholder}>
                    <Text style={{ color: '#777' }}>No Artwork</Text>
                </View>
            </View>

            <Text style={styles.title}>{currentTrack?.title || 'No Track Loaded'}</Text>
            <Text style={styles.artist}>{currentTrack?.artist || 'Unknown Artist'}</Text>

            <View style={styles.progressContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={progress.duration}
                    value={isSeeking ? seekValue : progress.position}
                    onValueChange={handleSeek}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#555555"
                    thumbTintColor="#FFFFFF"
                />
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatTime(isSeeking ? seekValue : progress.position)}</Text>
                    <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={skipToPrevious}>
                    <Text style={styles.controlText}>Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                    <Text style={styles.playButtonText}>
                        {playbackState.state === State.Playing ? 'Pause' : 'Play'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={skipToNext}>
                    <Text style={styles.controlText}>Next</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowSpeedModal(true)} style={styles.speedButton}>
                <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
            </TouchableOpacity>

            <Modal visible={showSpeedModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Playback Speed</Text>
                        <FlatList
                            data={speedOptions}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => changeSpeed(item)} style={styles.speedOption}>
                                    <Text style={[styles.speedText, playbackSpeed === item && styles.activeSpeedText]}>{item}x</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setShowSpeedModal(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 20,
    },
    artworkContainer: {
        width: 300,
        height: 300,
        marginBottom: 30,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    artworkPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    artist: {
        color: '#BBB',
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 30,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    timeText: {
        color: '#BBB',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    controlText: {
        color: '#FFF',
        fontSize: 18,
    },
    playButton: {
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    playButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    speedButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#555',
    },
    speedButtonText: {
        color: '#BBB',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    speedOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    speedText: {
        color: '#BBB',
        fontSize: 16,
        textAlign: 'center',
    },
    activeSpeedText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#555',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default PlayerScreen;
