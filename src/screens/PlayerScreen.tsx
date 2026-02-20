import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import TrackPlayer, {
  useProgress,
  usePlaybackState,
  State,
  useActiveTrack,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/usePlayerStore';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

export default function PlayerScreen() {
  const track = useActiveTrack();
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const { playbackRate, setPlaybackRate, setPosition } = usePlayerStore();
  const [speedModal, setSpeedModal] = useState(false);

  const isPlaying = playbackState.state === State.Playing;

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  const skipNext = useCallback(async () => {
    try { await TrackPlayer.skipToNext(); } catch (e) { console.warn('skipToNext failed', e); }
  }, []);

  const skipPrev = useCallback(async () => {
    try { await TrackPlayer.skipToPrevious(); } catch (e) { console.warn('skipToPrevious failed', e); }
  }, []);

  const onSeek = useCallback(
    async (value: number) => {
      await TrackPlayer.seekTo(value);
      setPosition(value);
    },
    [setPosition]
  );

  const selectSpeed = useCallback(
    async (speed: number) => {
      await TrackPlayer.setRate(speed);
      setPlaybackRate(speed);
      setSpeedModal(false);
    },
    [setPlaybackRate]
  );

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.artworkPlaceholder}>
        <Text style={styles.artworkIcon}>♪</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {track?.title ?? 'No track'}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track?.artist ?? ''}
        </Text>
      </View>

      <View style={styles.seekContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          value={progress.position}
          onSlidingComplete={onSeek}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#535353"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={skipPrev} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skipNext} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.speedBtn}
        onPress={() => setSpeedModal(true)}
      >
        <Text style={styles.speedText}>{playbackRate}x</Text>
      </TouchableOpacity>

      <Modal
        visible={speedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSpeedModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.speedModal}>
            <Text style={styles.speedModalTitle}>Playback Speed</Text>
            <FlatList
              data={SPEEDS}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speedOption,
                    item === playbackRate && styles.speedOptionActive,
                  ]}
                  onPress={() => selectSpeed(item)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      item === playbackRate && styles.speedOptionTextActive,
                    ]}
                  >
                    {item}x
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSpeedModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  artworkPlaceholder: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  artworkIcon: { fontSize: 80, color: '#1DB954' },
  info: { width: '100%', marginBottom: 24 },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  trackArtist: {
    color: '#B3B3B3',
    fontSize: 16,
    textAlign: 'center',
  },
  seekContainer: { width: '100%', marginBottom: 16 },
  slider: { width: '100%', height: 40 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: { color: '#B3B3B3', fontSize: 12 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
  },
  controlBtn: { padding: 12 },
  controlIcon: { fontSize: 28, color: '#FFFFFF' },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 28, color: '#000000' },
  speedBtn: {
    backgroundColor: '#282828',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speedText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  speedModal: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  speedModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  speedOption: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  speedOptionActive: { backgroundColor: '#1DB954' },
  speedOptionText: { color: '#FFFFFF', fontSize: 16 },
  speedOptionTextActive: { color: '#000000', fontWeight: 'bold' },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#B3B3B3', fontSize: 15 },
});
