import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from 'react-native-track-player';

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  position: number;
  playbackRate: number;
  setQueue: (queue: Track[], startIndex?: number) => void;
  setCurrentIndex: (index: number) => void;
  setPosition: (position: number) => void;
  setPlaybackRate: (rate: number) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      queue: [],
      currentIndex: 0,
      position: 0,
      playbackRate: 1.0,

      setQueue: (queue, startIndex = 0) =>
        set({ queue, currentIndex: startIndex, position: 0 }),

      setCurrentIndex: (currentIndex) => set({ currentIndex }),

      setPosition: (position) => set({ position }),

      setPlaybackRate: (playbackRate) => set({ playbackRate }),

      clearQueue: () =>
        set({ queue: [], currentIndex: 0, position: 0 }),
    }),
    {
      name: 'player-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        position: state.position,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
