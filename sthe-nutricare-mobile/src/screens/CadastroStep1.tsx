import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';

export function CadastroStep1({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  function handleProsseguir() {
    if(!nome || !email || !telefone) {
      return Alert.alert("Ops", "Preencha os campos para continuar.");
    }
    navigation.navigate('CadastroStep2', { 
      dadosPasso1: { nome, nascimento, email, telefone } 
    });
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Image source={require('../../assets/logo_ss_ss.png')} style={styles.logoMonogram} resizeMode="contain" />
          <Image source={require('../../assets/logo_stheffane_santos_nutricionista.png')} style={styles.logoText} resizeMode="contain" />
          
          <Text style={styles.subtitle}>PRA CRIAR SUA CONTA ME CONTA:</Text>

          <TextInput style={styles.input} placeholder="NOME COMPLETO" placeholderTextColor="#666" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="DATA DE NASCIMENTO" placeholderTextColor="#666" value={nascimento} onChangeText={setNascimento} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="EMAIL" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="NUMERO DE TELEFONE" placeholderTextColor="#666" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

          <TouchableOpacity onPress={handleProsseguir} style={styles.buttonContainer}>
            <View style={styles.mainButton}>
              <Text style={styles.buttonText}>PROSSEGUIR</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={styles.loginLink}>JA TEM CONTA? <Text style={{fontWeight: 'bold', color: '#2E7D32'}}>LOGIN</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  logoMonogram: { width: 90, height: 90, marginBottom: 10 },
  logoText: { width: 240, height: 70, marginBottom: 20 },
  subtitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center' },
  
  input: {
    width: '100%', height: 50, backgroundColor: '#FFFFFF',
    borderRadius: 25, borderWidth: 1, borderColor: '#FFD700',
    paddingHorizontal: 20, marginBottom: 15, color: '#333'
  },
  buttonContainer: { width: '100%', marginTop: 10 },
  mainButton: { 
    height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2E7D32', borderWidth: 1, borderColor: '#FFD700'
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loginLink: { color: '#333', fontSize: 14 }
});