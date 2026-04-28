import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/app/navigation/AppNavigator';
import AppProvider from './src/app/providers/AppProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
