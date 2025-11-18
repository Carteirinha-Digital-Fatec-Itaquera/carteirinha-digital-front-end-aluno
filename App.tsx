import React from 'react';
import Routes from './src/routes';
import { useFonts } from '@expo-google-fonts/montserrat';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Thin': require('./src/assets/fonts/Montserrat-Thin.ttf'),
    'Montserrat-ThinItalic': require('./src/assets/fonts/Montserrat-ThinItalic.ttf'),

    'Montserrat-ExtraLight': require('./src/assets/fonts/Montserrat-ExtraLight.ttf'),
    'Montserrat-ExtraLightItalic': require('./src/assets/fonts/Montserrat-ExtraLightItalic.ttf'),

    'Montserrat-Light': require('./src/assets/fonts/Montserrat-Light.ttf'),
    'Montserrat-LightItalic': require('./src/assets/fonts/Montserrat-LightItalic.ttf'),

    'Montserrat-Regular': require('./src/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Italic': require('./src/assets/fonts/Montserrat-Italic.ttf'),

    'Montserrat-Medium': require('./src/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-MediumItalic': require('./src/assets/fonts/Montserrat-MediumItalic.ttf'),

    'Montserrat-SemiBold': require('./src/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-SemiBoldItalic': require('./src/assets/fonts/Montserrat-SemiBoldItalic.ttf'),

    'Montserrat-Bold': require('./src/assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-BoldItalic': require('./src/assets/fonts/Montserrat-BoldItalic.ttf'),

    'Montserrat-ExtraBold': require('./src/assets/fonts/Montserrat-ExtraBold.ttf'),
    'Montserrat-ExtraBoldItalic': require('./src/assets/fonts/Montserrat-ExtraBoldItalic.ttf'),

    'Montserrat-Black': require('./src/assets/fonts/Montserrat-Black.ttf'),
    'Montserrat-BlackItalic': require('./src/assets/fonts/Montserrat-BlackItalic.ttf'),
  });


  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Routes />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
