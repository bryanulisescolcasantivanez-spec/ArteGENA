const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Asegurar soporte para archivos .bin de TensorFlow
config.resolver.assetExts.push('bin');

module.exports = config;