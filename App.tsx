import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PocMapScreen } from './src/screens/PocMapScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <PocMapScreen />
    </>
  );
}

