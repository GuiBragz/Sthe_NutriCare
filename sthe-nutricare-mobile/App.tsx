import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Agendamento } from './src/screens/Agendamento';
import { Home } from './src/screens/Home'; 

// ⚠️ CONFIRA SE O SEU IP CONTINUA O MESMO
const API_URL = 'http://192.168.1.3:3000/login'; 

const Stack = createNativeStackNavigator();

// --- TELA DE LOGIN (Componente) ---
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return Alert.alert('Erro', 'Preencha tudo!');
    
    setLoading(true);
    try {
      const response = await axios.post(API_URL, { email, senha });
      
      // SUCESSO! Navega para a Home e leva o nome do usuário junto
      navigation.navigate('Home', { 
        nome: response.data.usuario.nome, // <--- Vírgula adicionada aqui!
        id: response.data.usuario.id
      });

    } catch (error: any) {
      Alert.alert('Erro', 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sthe NutriCare 🍎</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput 
          style={styles.input} 
          placeholder="admin@sthe.com" 
          placeholderTextColor="#999"
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="***" 
          placeholderTextColor="#999"
          secureTextEntry value={senha} onChangeText={setSenha} 
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
      </TouchableOpacity>
    </View>
  );
}

// --- APP PRINCIPAL (Rotas) ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#04D361', marginBottom: 40 },
  inputContainer: { width: '100%', marginBottom: 16 },
  label: { color: '#E1E1E6', marginBottom: 8, fontSize: 14 },
  input: { width: '100%', height: 56, backgroundColor: '#202024', borderRadius: 8, paddingHorizontal: 16, color: '#FFF', borderWidth: 1, borderColor: '#323238' },
  button: { width: '100%', height: 56, backgroundColor: '#04D361', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});