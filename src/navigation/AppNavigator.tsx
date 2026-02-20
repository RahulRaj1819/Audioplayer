import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import LibraryScreen from '../screens/LibraryScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SongPickerScreen from '../screens/SongPickerScreen';
import PlaylistPickerScreen from '../screens/PlaylistPickerScreen';
import MiniPlayer from '../components/MiniPlayer';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  PlaylistDetail: { playlistId: number; playlistName: string };
  SongPicker: { playlistId: number; playlistName: string };
  PlaylistPicker: { onSelect?: (id: number) => void } | undefined;
};

export type TabParamList = {
  Library: undefined;
  Playlists: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const darkScreenOptions = {
  headerStyle: { backgroundColor: '#121212' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' as const },
  cardStyle: { backgroundColor: '#121212' },
};

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{name}</Text>;
}

function MainTabs() {
  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#121212', borderTopColor: '#333' },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#B3B3B3',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#FFFFFF',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="🎵" color={color} />,
          }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
          }}
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#1DB954',
          background: '#121212',
          card: '#121212',
          text: '#FFFFFF',
          border: '#333333',
          notification: '#1DB954',
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator screenOptions={darkScreenOptions}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ title: 'Now Playing' }}
        />
        <Stack.Screen
          name="PlaylistDetail"
          component={PlaylistDetailScreen}
          options={{ title: 'Playlist' }}
        />
        <Stack.Screen
          name="SongPicker"
          component={SongPickerScreen}
          options={{ title: 'Add Songs' }}
        />
        <Stack.Screen
          name="PlaylistPicker"
          component={PlaylistPickerScreen}
          options={{ title: 'Select Playlist' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, backgroundColor: '#121212' },
});
