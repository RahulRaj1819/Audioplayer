import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

let ReceiveSharingIntent = null;
try {
    ReceiveSharingIntent = require('react-native-receive-sharing-intent').default;
} catch (e) {
    console.warn('react-native-receive-sharing-intent not available', e);
}

const ShareHandler = () => {
    const navigation = useNavigation();

    useEffect(() => {
        if (!ReceiveSharingIntent) return;

        try {
            ReceiveSharingIntent.getReceivedFiles(
                (files) => {
                    if (files && files.length > 0) {
                        const audioFile = files[0];
                        navigation.navigate('PlaylistPicker', { sharedFile: audioFile });
                    }
                },
                (error) => {
                    console.warn('ShareHandler error:', error);
                },
                'ShareMedia'
            );
        } catch (e) {
            console.warn('ShareHandler setup failed:', e);
        }

        return () => {
            try {
                if (ReceiveSharingIntent) {
                    ReceiveSharingIntent.clearReceivedFiles();
                }
            } catch (e) { }
        };
    }, []);

    return null;
};

export default ShareHandler;
