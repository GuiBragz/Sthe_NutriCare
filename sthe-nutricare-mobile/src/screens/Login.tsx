import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// ⚠️ CONFIRA SE O SEU IP ESTÁ CERTO
const API_URL = 'http://192.168.1.3:3000/login';

export function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return Alert.alert('Atenção', 'Preencha email e senha!');
    
    setLoading(true);
    try {
      const response = await axios.post(API_URL, { email, senha });
      
      // 👇 A MÁGICA ACONTECE AQUI 👇
      // Em vez de ir para 'Home', vamos para 'MainTabs' (a tela com a barra embaixo)
      // E usamos reset para ele não conseguir voltar para o login com o botão voltar
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'MainTabs', 
          params: { 
            nome: response.data.usuario.nome,
            id: response.data.usuario.id
          } 
        }],
      });

    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#C8A2C8', '#A555B9']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {/* LOGO */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" /> 
        <Text style={styles.brandTitle}>Sthe<Text style={{color: '#2F9F85'}}>NutriCare</Text></Text>

        {/* INPUT EMAIL */}
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#333" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor="#666"
            value={email} onChangeText={setEmail} autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* INPUT SENHA */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#333" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="SENHA"
            placeholderTextColor="#666"
            secureTextEntry value={senha} onChangeText={setSenha}
          />
        </View>

        {/* BOTÃO ENTRAR */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} disabled={loading}>
          <LinearGradient
            colors={['#A555B9', '#2F9F85']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
          </LinearGradient>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  
  logo: { width: 120, height: 120, marginBottom: 5 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: '#A555B9', marginBottom: 30 },
  
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 30, borderWidth: 2, borderColor: '#2F9F85',
    paddingHorizontal: 15, marginBottom: 15, height: 55, width: '100%',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333' },
  
  buttonContainer: { width: '100%', marginTop: 20 },
  gradientButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }
});