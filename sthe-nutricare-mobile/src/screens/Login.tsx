import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 👇 IMPORTA O NOSSO ARQUIVO CENTRALIZADO
import api from '../services/api'; 

export function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return Alert.alert('Atenção', 'Preencha email e senha!');
    
    setLoading(true);
    try {
      const response = await api.post('/login', { email, senha });
      const user = response.data.usuario;
      
      // 👇 VERIFICA O TIPO DE USUÁRIO PARA DIRECIONAR
      if (user.tipo === 'NUTRICIONISTA') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'NutriTabs' }], // Vai para o painel da Nutri
          });
      } else {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'MainTabs', // Vai para o painel do Paciente
              params: { 
                nome: user.nomeCompleto || user.nome, // Garante que pega o nome
                id: user.id
              } 
            }],
          });
      }

    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  function handleEsqueciSenha() {
    // Aqui você conectaria com uma rota de recuperação de senha no futuro
    Alert.alert("Recuperação", "Enviamos um link para o seu e-mail (Simulação).");
  }

  function handleGoogleLogin() {
    // Aqui entra a integração real com Firebase/Google Auth
    Alert.alert("Google", "Login com Google em desenvolvimento! 🚧");
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#C8A2C8', '#A555B9']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" /> 
        <Text style={styles.brandTitle}>Sthe<Text style={{color: '#2F9F85'}}>NutriCare</Text></Text>

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

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#333" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="SENHA"
            placeholderTextColor="#666"
            secureTextEntry value={senha} onChangeText={setSenha}
          />
        </View>

        {/* LINK ESQUECI A SENHA */}
        <TouchableOpacity style={styles.forgotBtn} onPress={handleEsqueciSenha}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} disabled={loading}>
          <LinearGradient
            colors={['#A555B9', '#2F9F85']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {/* DIVISOR "OU" */}
        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
        </View>

        {/* BOTÃO GOOGLE */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={24} color="#EA4335" style={{marginRight: 10}} />
            <Text style={styles.googleText}>Entrar com Google</Text>
        </TouchableOpacity>

        {/* LINK CRIAR CONTA */}
        <TouchableOpacity style={styles.createAccountBtn} onPress={() => navigation.navigate('CadastroStep1')}>
            <Text style={styles.createAccountText}>Não tem conta? <Text style={{fontWeight: 'bold', color: '#2F9F85'}}>Cadastre-se</Text></Text>
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
  
  // Esqueci a senha
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginRight: 10 },
  forgotText: { color: '#555', fontSize: 14, fontWeight: '600' },

  buttonContainer: { width: '100%', marginBottom: 30 },
  gradientButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },

  // Divisor
  dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  dividerText: { marginHorizontal: 10, color: '#666', fontWeight: 'bold' },

  // Botão Google
  googleBtn: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: '#FFF', width: '100%', height: 55, borderRadius: 30,
      elevation: 2, marginBottom: 30
  },
  googleText: { color: '#555', fontSize: 16, fontWeight: 'bold' },

  // Criar Conta
  createAccountBtn: { marginTop: 10 },
  createAccountText: { color: '#333', fontSize: 16 }
});