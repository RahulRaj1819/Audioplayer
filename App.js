import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from './src/store/usePlayerStore';
import { SetupService } from './src/services/SetupService';

export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function setup() {
      try {
        let isSetup = await SetupService();

        if (isSetup) {
          // Restore state
          try {
            const { queue, currentTrack, position } = usePlayerStore.getState();
            if (queue && queue.length > 0) {
              await TrackPlayer.reset();
              await TrackPlayer.add(queue);

              if (currentTrack) {
                const index = queue.findIndex(t => t.id === currentTrack.id);
                if (index !== -1) {
                  await TrackPlayer.skip(index);
                }
              }

              if (position > 0) {
                await TrackPlayer.seekTo(position);
              }
            }
          } catch (restoreErr) {
            // Silent fail on restore - not critical
            console.warn('State restore failed:', restoreErr);
          }
        }

        setIsPlayerReady(true);
      } catch (err) {
        console.error('Player setup failed:', err);
        // Still show the app even if player fails
        setIsPlayerReady(true);
      }
    }
    setup();
  }, []);

  if (!isPlayerReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#BB86FC" />
        <Text style={styles.loadingText}>Loading Player...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
});
