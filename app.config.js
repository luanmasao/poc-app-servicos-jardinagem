module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []).filter(
        (plugin) =>
          !(Array.isArray(plugin) && plugin[0] === 'react-native-maps') &&
          plugin !== 'react-native-maps'
      ),
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      ],
    ],
  };
};
