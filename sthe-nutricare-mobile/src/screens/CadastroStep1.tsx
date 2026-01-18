import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function CadastroStep1({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  function handleProsseguir() {
    if(!nome || !email || !telefone) {
      return Alert.alert("Ops!", "Preencha os campos para continuar.");
    }
    // Navega para o passo 2 levando os dados na mala
    navigation.navigate('CadastroStep2', { 
      dadosPasso1: { nome, nascimento, email, telefone } 
    });
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#C8A2C8', '#A555B9']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          
          <Text style={styles.brandTitle}>Sthe<Text style={{color: '#2F9F85'}}>NutriCare</Text></Text>
          <Text style={styles.subtitle}>PRA CRIAR SUA CONTA ME CONTA:</Text>

          {/* INPUTS */}
          <TextInput style={styles.input} placeholder="NOME COMPLETO" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="DATA DE NASCIMENTO" value={nascimento} onChangeText={setNascimento} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="EMAIL" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="NUMERO DE TELEFONE" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

          {/* BOTÃO */}
          <TouchableOpacity onPress={handleProsseguir} style={styles.buttonContainer}>
            <LinearGradient colors={['#A555B9', '#2F9F85']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.gradientButton}>
              <Text style={styles.buttonText}>PROSSEGUIR</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={styles.loginLink}>JÁ TEM CONTA? <Text style={{fontWeight: 'bold'}}>LOGIN</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  logo: { width: 120, height: 120, marginBottom: 10 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: '#A555B9', marginBottom: 5 },
  subtitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center' },
  
  input: {
    width: '100%', height: 50, backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 25, borderWidth: 2, borderColor: '#A555B9', // Borda Roxa
    paddingHorizontal: 20, marginBottom: 15, color: '#333'
  },
  buttonContainer: { width: '100%', marginTop: 10 },
  gradientButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  loginLink: { color: '#333', fontSize: 12 }
});