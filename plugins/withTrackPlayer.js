const { withAndroidManifest } = require('@expo/config-plugins');

const withTrackPlayerService = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest.application[0];

        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        const serviceName = 'com.doublesymmetry.trackplayer.service.MusicService';

        // Check if service already exists
        const serviceExists = mainApplication.service.some(
            (service) => service.$['android:name'] === serviceName
        );

        if (!serviceExists) {
            mainApplication.service.push({
                $: {
                    'android:name': serviceName,
                    'android:enabled': 'true',
                    'android:exported': 'true',
                },
                'intent-filter': [
                    {
                        action: [
                            {
                                $: {
                                    'android:name': 'android.media.browse.MediaBrowserService',
                                },
                            },
                        ],
                    },
                ],
            });
        }

        return config;
    });
};

module.exports = withTrackPlayerService;
