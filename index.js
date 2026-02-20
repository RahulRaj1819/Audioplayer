import 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/PlaybackService';
import App from './App';

TrackPlayer.registerPlaybackService(() => PlaybackService);

export { default } from './App';
