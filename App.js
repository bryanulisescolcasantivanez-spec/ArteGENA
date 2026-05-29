import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as tf from '@tensorflow/tfjs';

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);

  useEffect(() => {
    async function prepareMobileApp() {
      await tf.ready();
      setIsTfReady(true);
    }
    prepareMobileApp();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', fontSize: 24 }}>ArtGen Móvil 📱</Text>
      <Text style={{ color: '#aaa', marginTop: 10 }}>
        Motor IA: {isTfReady ? '✅ Inicializado en GPU' : '⏳ Cargando...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }
});