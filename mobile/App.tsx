import React from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Force dark background on web so the root container isn't light gray */}
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1440,
          alignSelf: 'center',
          backgroundColor: '#0B0F19',
          ...(Platform.OS === 'web' ? { minHeight: '100vh' as any } : {}),
        }}
      >
        <StatusBar style="light" />
        <AuthProvider>
          <AppProvider>
            <AppNavigator />
          </AppProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
