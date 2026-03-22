import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export function Welcome({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        <Image 
          source={require('../../assets/logo_ss_ss.png')} 
          style={styles.logoMonogram} 
          resizeMode="contain" 
        />
        
        <Image 
          source={require('../../assets/logo_stheffane_santos_nutricionista.png')} 
          style={styles.logoText} 
          resizeMode="contain" 
        />

        <TouchableOpacity 
          style={styles.btnEntrarContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnEntrar}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CadastroStep1')}>
          <Text style={styles.btnCriar}>CRIAR CONTA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#EFEDE7'
  },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 30 
  },
  logoMonogram: { 
    width: 150, 
    height: 150, 
    marginBottom: 20 
  },
  logoText: { 
    width: 280, 
    height: 80, 
    marginBottom: 60 
  },
  btnEntrarContainer: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  btnEntrar: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    letterSpacing: 1 
  },
  btnCriar: { 
    fontSize: 16, 
    color: '#2E7D32', 
    fontWeight: 'bold' 
  }
});