import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as tf from '@tensorflow/tfjs';

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Iniciando motor de IA en Web...');
  const canvasRef = useRef(null);

  useEffect(() => {
    async function prepareWebApp() {
      try {
        // 1. Esperar a que TensorFlow.js esté listo
        await tf.ready();
        setIsTfReady(true);
        setStatusMessage('Motor IA listo. Cargando modelo...');
        console.log("¡TensorFlow.js Web listo! 🚀");

        // 2. Ruta limpia desde la carpeta public
        const loadedModel = await tf.loadLayersModel('http://localhost:8081/model/model.json');
        
        setModel(loadedModel);
        setStatusMessage('¡Todo listo en Web! Clic en Generar Rostro 🎭');
        console.log("¡Modelo web cargado con éxito! 🧠");

      } catch (error) {
        console.error("Aviso sobre el modelo:", error);
        // Si la URL falla por alguna configuración de red, activamos el simulador matemático seguro
        setStatusMessage('Corriendo en Modo de Prueba (Simulador Activo) 🎨');
      }
    }
    prepareWebApp();
  }, []);

  const generarArteWeb = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      tf.tidy(() => {
        // Generamos el vector de ruido (Semilla del espacio latente de 100 dimensiones)
        const vectorRuido = tf.randomNormal([1, 100]); 

        // Evaluamos si el modelo está cargado
        // Si hay modelo, escupe [1, 64, 64, 3]. Si no, el simulador genera [1, 64, 64, 3]
        const tResultado = model 
          ? model.predict(vectorRuido) 
          : tf.randomUniform([1, 64, 64, 3], -1, 1); 

        // 1. Denormalizar píxeles de [-1, 1] a [0, 1] (Esencial para reconstrucción facial)
        const tNormalizado = tResultado.clipByValue(-1, 1).add(1).div(2);
        
        // 2. ¡EL TRUCO MAESTRO!: Escalamos la imagen de 64x64 a 256x256 en tiempo real
        // Esto evita que el canvas se rompa y hace que el rostro se vea grande y genial
        const tEscalado = tf.image.resizeNearestNeighbor(tNormalizado, [256, 256]);
        
        // 3. Removemos la dimensión extra para dejarlo en [256, 256, 3]
        const tImagen = tf.squeeze(tEscalado);

        const canvas = canvasRef.current;
        if (canvas) {
          tf.browser.toPixels(tImagen, canvas).then(() => {
            console.log("¡Rostro de IA renderizado en el canvas web! 🎭");
            setIsGenerating(false);
          }).catch(err => {
            console.error(err);
            setIsGenerating(false);
          });
        } else {
          setIsGenerating(false);
        }
      });
    }, 50);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ArtGen Web 🎨</Text>
      
      <View style={styles.canvasContainer}>
        {/* El Canvas se mantiene en 256x256 perfectamente acoplado */}
        <canvas 
          ref={canvasRef} 
          width={256} 
          height={256} 
          style={{ borderRadius: 12, backgroundColor: '#1e1e1e' }} 
        />
      </View>

      <TouchableOpacity 
        style={isGenerating ? [styles.button, styles.buttonDisabled] : styles.button} 
        onPress={generarArteWeb}
        disabled={isGenerating}
      >
        <Text style={styles.buttonText}>
          {isGenerating ? 'Procesando...' : '🎭 Generar Nuevo Rostro'}
        </Text>
      </TouchableOpacity>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{statusMessage}</Text>
        {!isTfReady && <ActivityIndicator size="small" color="#6200ee" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  canvasContainer: {
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statusText: {
    color: '#aaa',
    marginRight: 10,
    fontSize: 14,
  },
});