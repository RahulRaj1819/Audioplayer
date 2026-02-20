import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import LibraryScreen from '../screens/LibraryScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistScreen from '../screens/PlaylistScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

import { View } from 'react-native';
import MiniPlayer from '../components/MiniPlayer';
import SongPickerScreen from '../screens/SongPickerScreen';
import PlaylistPickerScreen from '../screens/PlaylistPickerScreen';
import ShareHandler from '../components/ShareHandler';

const PlaylistStack = createStackNavigator();

const PlaylistStackNavigator = () => {
    return (
        <PlaylistStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#121212' } }}>
            <PlaylistStack.Screen name="PlaylistView" component={PlaylistScreen} />
            <PlaylistStack.Screen name="SongPicker" component={SongPickerScreen} options={{ presentation: 'modal' }} />
        </PlaylistStack.Navigator>
    );
};

const MainTabs = () => {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: { height: 60, paddingBottom: 5, backgroundColor: '#1E1E1E', borderTopColor: '#333' },
                    tabBarActiveTintColor: '#BB86FC',
                    tabBarInactiveTintColor: '#777',
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#FFF',
                }}
            >
                <Tab.Screen name="Library" component={LibraryScreen} />
                <Tab.Screen name="Playlists" component={PlaylistStackNavigator} />
            </Tab.Navigator>
            <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0 }}>
                <MiniPlayer />
            </View>
            <ShareHandler />
        </View>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="PlaylistPicker" component={PlaylistPickerScreen} options={{ presentation: 'modal' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
