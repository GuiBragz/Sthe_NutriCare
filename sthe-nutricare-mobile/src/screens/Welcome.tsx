import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// 👇 O NOME AQUI PRECISA SER "Welcome"
export function Welcome({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#C8A2C8', '#A555B9']} 
      style={styles.container}
    >
      <View style={styles.content}>
        
        {/* LOGO */}
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        
        <Text style={styles.brandTitle}>Sthe<Text style={{color: '#2F9F85'}}>NutriCare</Text></Text>

        {/* BOTÃO ENTRAR (Vai para Login) */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnEntrar}>ENTRAR</Text>
        </TouchableOpacity>

        {/* BOTÃO CRIAR CONTA (Vai para o Cadastro Passo 1) */}
        <TouchableOpacity onPress={() => navigation.navigate('CadastroStep1')}>
          <Text style={styles.btnCriar}>CRIAR CONTA</Text>
        </TouchableOpacity>
      </View>
      
      {/* Decoração rodapé */}
      <View style={styles.footerDecoration} /> 
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  logo: { width: 180, height: 180, marginBottom: 10 },
  brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#A555B9', marginBottom: 60 },
  
  btnEntrar: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, letterSpacing: 1 },
  btnCriar: { fontSize: 18, color: '#333', fontWeight: '500' },
  
  footerDecoration: { height: 100, width: '100%', opacity: 0.3 }
});