import React from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1440,
          alignSelf: 'center',
          backgroundColor: Colors.background,
          ...(Platform.OS === 'web' ? { minHeight: '100vh' as any } : {}),
        }}
      >
        <StatusBar style="dark" />
        <AuthProvider>
          <AppProvider>
            <AppNavigator />
          </AppProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
