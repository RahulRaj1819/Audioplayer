import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TrackPlayer, {
  usePlaybackState,
  useActiveTrack,
  State,
} from 'react-native-track-player';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function MiniPlayer() {
  const navigation = useNavigation<NavProp>();
  const track = useActiveTrack();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  if (!track) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      <View style={styles.artworkSmall}>
        <Text style={styles.artworkIcon}>♪</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title ?? 'Unknown'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist ?? ''}
        </Text>
      </View>
      <TouchableOpacity onPress={togglePlay} style={styles.btn}>
        <Text style={styles.btnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          try { await TrackPlayer.skipToNext(); } catch (e) { console.warn('skipToNext failed', e); }
        }}
        style={styles.btn}
      >
        <Text style={styles.btnIcon}>⏭</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#404040',
  },
  artworkSmall: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  artworkIcon: { fontSize: 22, color: '#1DB954' },
  info: { flex: 1, marginRight: 8 },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  artist: { color: '#B3B3B3', fontSize: 12, marginTop: 2 },
  btn: { padding: 10 },
  btnIcon: { fontSize: 22, color: '#FFFFFF' },
});
