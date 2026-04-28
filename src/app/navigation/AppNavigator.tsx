import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailScreen from '../../features/metals/screens/DetailScreen';
import HomeScreen from '../../features/metals/screens/HomeScreen';
import {RootStackParamList} from '../../features/metals/types';
import {useTheme} from '../../shared/theme/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {theme} = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: theme.colors.background},
          headerShadowVisible: false,
          headerStyle: {backgroundColor: theme.colors.background},
          headerTintColor: theme.colors.primaryText,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Metal Prices'}}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({route}) => ({title: route.params.metal.name})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
