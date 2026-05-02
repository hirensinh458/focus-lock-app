import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../app/HomeScreen';
import CreateTaskScreen from '../app/CreateTaskScreen';
import TaskDetailScreen from '../app/TaskDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0F' } }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}