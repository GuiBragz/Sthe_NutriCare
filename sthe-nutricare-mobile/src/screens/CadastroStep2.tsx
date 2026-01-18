import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// ⚠️ CONFIRA SEU IP
const API_URL = 'http://192.168.1.3:3000/usuarios'; // Rota de cadastro (POST)

export function CadastroStep2({ route, navigation }: any) {
  // Recebe os dados da tela anterior
  const { dadosPasso1 } = route.params;

  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | null>(null);
  const [senha, setSenha] = useState(''); // Precisamos pedir senha em algum lugar! Vou por aqui.
  
  // Objetivos (Array de strings)
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para marcar/desmarcar checkbox
  const toggleObjetivo = (obj: string) => {
    if (objetivos.includes(obj)) {
      setObjetivos(objetivos.filter(item => item !== obj));
    } else {
      setObjetivos([...objetivos, obj]);
    }
  };

  async function handleFinalizar() {
    if(!altura || !sexo || !senha) return Alert.alert("Falta pouco!", "Preencha altura, sexo e crie uma senha.");

    setLoading(true);
    try {
      // Junta tudo num pacotão
      const payload = {
        ...dadosPasso1,
        altura,
        sexo,
        senha,
        objetivos: objetivos.join(',') // Vira "SAUDE,EMAGRECER"
      };

      await axios.post(API_URL, payload);
      
      Alert.alert("Sucesso! 🎉", "Conta criada. Faça login agora.");
      navigation.navigate('Login');

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#C8A2C8', '#A555B9']} style={styles.container}>
      <View style={styles.content}>
        
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#A555B9" />
        </TouchableOpacity>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandTitle}>Sthe<Text style={{color: '#2F9F85'}}>NutriCare</Text></Text>

        {/* ALTURA */}
        <TextInput 
          style={styles.input} 
          placeholder="SUA ALTURA (ex: 1.75)" 
          value={altura} 
          onChangeText={setAltura} 
          keyboardType="numeric" 
        />
        
        {/* SENHA (Adicionei aqui pois é obrigatório para login) */}
        <TextInput 
          style={styles.input} 
          placeholder="CRIE UMA SENHA" 
          secureTextEntry
          value={senha} 
          onChangeText={setSenha} 
        />

        {/* CARD OBJETIVOS */}
        <View style={styles.cardObjetivos}>
          <Text style={styles.cardTitle}>QUAL O SEU OBJETIVO?</Text>
          {['EMAGRECER', 'PERFORMANCE', 'GANHAR MASSA', 'SAUDE'].map((obj) => (
            <TouchableOpacity key={obj} style={styles.checkboxRow} onPress={() => toggleObjetivo(obj)}>
              <Ionicons 
                name={objetivos.includes(obj) ? "checkbox" : "square-outline"} 
                size={24} 
                color="#333" 
              />
              <Text style={styles.checkboxLabel}>{obj}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEXO */}
        <View style={styles.sexoContainer}>
          <TouchableOpacity onPress={() => setSexo('F')} style={[styles.sexoBtn, sexo === 'F' && styles.sexoBtnSelected]}>
            <Ionicons name="female" size={24} color={sexo === 'F' ? "#FFF" : "#A555B9"} />
          </TouchableOpacity>
          
          <View style={styles.sexoLabelBox}>
             <Text style={styles.sexoText}>SEXO</Text>
          </View>

          <TouchableOpacity onPress={() => setSexo('M')} style={[styles.sexoBtn, sexo === 'M' && styles.sexoBtnSelected]}>
            <Ionicons name="male" size={24} color={sexo === 'M' ? "#FFF" : "#A555B9"} />
          </TouchableOpacity>
        </View>

        {/* BOTÃO FINAL */}
        <TouchableOpacity onPress={handleFinalizar} style={styles.buttonContainer} disabled={loading}>
          <LinearGradient colors={['#A555B9', '#2F9F85']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.gradientButton}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>CRIAR CONTA</Text>}
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  logo: { width: 100, height: 100, marginBottom: 5 },
  brandTitle: { fontSize: 24, fontWeight: 'bold', color: '#A555B9', marginBottom: 20 },
  
  input: {
    width: '100%', height: 50, backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 25, borderWidth: 2, borderColor: '#2F9F85', // Borda Verde
    paddingHorizontal: 20, marginBottom: 10, color: '#333'
  },

  // Card Objetivos
  cardObjetivos: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 15,
    padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#A555B9'
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkboxLabel: { marginLeft: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },

  // Seletor Sexo
  sexoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sexoBtn: { 
    padding: 10, borderRadius: 50, borderWidth: 2, borderColor: '#A555B9', backgroundColor: '#FFF' 
  },
  sexoBtnSelected: { backgroundColor: '#A555B9' },
  sexoLabelBox: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15 },
  sexoText: { fontWeight: 'bold', color: '#333' },

  buttonContainer: { width: '100%' },
  gradientButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
});