import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

// Register playback service BEFORE registerRootComponent
TrackPlayer.registerPlaybackService(() => require('./src/services/PlaybackService'));

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
