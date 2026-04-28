import React, {PropsWithChildren} from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { queryClient } from '../../lib/queryClient';
import {ThemeProvider} from '../../shared/theme/ThemeContext';

export default function AppProvider({children}: PropsWithChildren) {
  return (
  <SafeAreaProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  </SafeAreaProvider>
  );
}
