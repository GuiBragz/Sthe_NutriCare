import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function CadastroStep2({ route, navigation }: any) {
  const { dadosPasso1 } = route.params;

  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | null>(null);
  const [senha, setSenha] = useState(''); 
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleObjetivo = (obj: string) => {
    if (objetivos.includes(obj)) {
      setObjetivos(objetivos.filter(item => item !== obj));
    } else {
      setObjetivos([...objetivos, obj]);
    }
  };

  async function handleFinalizar() {
    if(!altura || !sexo || !senha) return Alert.alert("Falta pouco", "Preencha altura, sexo e crie uma senha.");

    setLoading(true);
    try {
      const payload = {
        ...dadosPasso1,
        altura,
        sexo,
        senha,
        objetivos: objetivos.join(',') 
      };

      await api.post('/usuarios', payload);
      
      Alert.alert("Sucesso!", "Conta criada. Faca login agora.");
      navigation.navigate('Login');

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Nao foi possivel criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#2E7D32" />
        </TouchableOpacity>

        <Image source={require('../../assets/logo_ss_ss.png')} style={styles.logoMonogram} resizeMode="contain" />
        <Image source={require('../../assets/logo_stheffane_santos_nutricionista.png')} style={styles.logoText} resizeMode="contain" />

        <TextInput 
          style={styles.input} 
          placeholder="SUA ALTURA (ex: 1.75)" 
          placeholderTextColor="#666"
          value={altura} 
          onChangeText={setAltura} 
          keyboardType="numeric" 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="CRIE UMA SENHA" 
          placeholderTextColor="#666"
          secureTextEntry
          value={senha} 
          onChangeText={setSenha} 
        />

        <View style={styles.cardObjetivos}>
          <Text style={styles.cardTitle}>QUAL O SEU OBJETIVO?</Text>
          {['EMAGRECER', 'PERFORMANCE', 'GANHAR MASSA', 'SAUDE'].map((obj) => (
            <TouchableOpacity key={obj} style={styles.checkboxRow} onPress={() => toggleObjetivo(obj)}>
              <Ionicons 
                name={objetivos.includes(obj) ? "checkbox" : "square-outline"} 
                size={24} 
                color="#2E7D32" 
              />
              <Text style={styles.checkboxLabel}>{obj}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sexoContainer}>
          <TouchableOpacity onPress={() => setSexo('F')} style={[styles.sexoBtn, sexo === 'F' && styles.sexoBtnSelected]}>
            <Ionicons name="female" size={24} color={sexo === 'F' ? "#FFFFFF" : "#2E7D32"} />
          </TouchableOpacity>
          
          <View style={styles.sexoLabelBox}>
             <Text style={styles.sexoText}>SEXO</Text>
          </View>

          <TouchableOpacity onPress={() => setSexo('M')} style={[styles.sexoBtn, sexo === 'M' && styles.sexoBtnSelected]}>
            <Ionicons name="male" size={24} color={sexo === 'M' ? "#FFFFFF" : "#2E7D32"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleFinalizar} style={styles.buttonContainer} disabled={loading}>
          <View style={styles.mainButton}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>CRIAR CONTA</Text>}
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  logoMonogram: { width: 70, height: 70, marginBottom: 5 },
  logoText: { width: 200, height: 60, marginBottom: 20 },
  
  input: {
    width: '100%', height: 50, backgroundColor: '#FFFFFF',
    borderRadius: 25, borderWidth: 1, borderColor: '#FFD700', 
    paddingHorizontal: 20, marginBottom: 10, color: '#333'
  },

  cardObjetivos: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 15,
    padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#FFD700'
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#2E7D32' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkboxLabel: { marginLeft: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },

  sexoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sexoBtn: { 
    padding: 10, borderRadius: 50, borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#FFFFFF' 
  },
  sexoBtnSelected: { backgroundColor: '#2E7D32' },
  sexoLabelBox: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, borderWidth: 1, borderColor: '#FFD700' },
  sexoText: { fontWeight: 'bold', color: '#333' },

  buttonContainer: { width: '100%' },
  mainButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', borderWidth: 1, borderColor: '#FFD700' },
  buttonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
});