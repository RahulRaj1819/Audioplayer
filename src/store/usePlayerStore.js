import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePlayerStore = create(
    persist(
        (set) => ({
            isPlaying: false,
            currentTrack: null,
            position: 0,
            duration: 0,
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            setCurrentTrack: (currentTrack) => set({ currentTrack }),
            setPosition: (position) => set({ position }),
            setDuration: (duration) => set({ duration }),

            // Queue Management
            queue: [],
            setQueue: (queue) => set({ queue }),
            addTrack: (track) => set((state) => ({ queue: [...state.queue, track] })),
            resetQueue: () => set({ queue: [] }),
        }),
        {
            name: 'audioplayer-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                currentTrack: state.currentTrack,
                queue: state.queue,
                position: state.position
            }), // Only persist these
        }
    )
);
