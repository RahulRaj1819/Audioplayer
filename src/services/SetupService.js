import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

export const SetupService = async () => {
    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 10,
        });

        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2,
        });

        return true;
    } catch (error) {
        if (error.message === 'The player has already been initialized via setupPlayer.') {
            return true;
        }
        console.error('SetupService error:', error);
        return false;
    }
};
