import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function CadastroStep2({ route, navigation }: any) {
  const { dadosPasso1 } = route.params;

  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | null>(null);
  const [senha, setSenha] = useState(''); 
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [modalTermosVisible, setModalTermosVisible] = useState(false);

  const toggleObjetivo = (obj: string) => {
    if (objetivos.includes(obj)) {
      setObjetivos(objetivos.filter(item => item !== obj));
    } else {
      setObjetivos([...objetivos, obj]);
    }
  };

  async function handleFinalizar() {
    if(!altura || !sexo || !senha) return Alert.alert("Falta pouco", "Preencha altura, sexo e crie uma senha.");
    if(!termosAceitos) return Alert.alert("LGPD", "Voce precisa ler e aceitar os Termos de Uso e Politica de Privacidade para continuar.");

    setLoading(true);
    try {
      const payload = {
        ...dadosPasso1,
        altura,
        sexo,
        senha,
        objetivos: objetivos.join(','),
        termosAceitos: true 
      };

      await api.post('/usuarios', payload);
      
      Alert.alert("Sucesso", "Conta criada. Faca login agora.");
      navigation.navigate('Login');

    } catch (error) {
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

        <View style={styles.termosContainer}>
          <TouchableOpacity onPress={() => setTermosAceitos(!termosAceitos)} style={styles.checkboxRow}>
            <Ionicons name={termosAceitos ? "checkbox" : "square-outline"} size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.termosText}>
            Li e concordo com os{' '}
            <Text style={styles.termosLink} onPress={() => setModalTermosVisible(true)}>Termos de Uso e Privacidade</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={handleFinalizar} style={styles.buttonContainer} disabled={loading}>
          <View style={styles.mainButton}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>CRIAR CONTA</Text>}
          </View>
        </TouchableOpacity>

      </View>

      <Modal visible={modalTermosVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Termos de Uso e Privacidade</Text>
            <ScrollView style={styles.scrollTermos} showsVerticalScrollIndicator={false}>
              <Text style={styles.textoLongoTermos}>
                1. Coleta de Dados: O aplicativo StheNutriCare coleta dados de saude, medidas, habitos alimentares e rotina com o proposito exclusivo de analise nutricional e elaboracao de planos alimentares personalizados.{"\n\n"}
                2. Armazenamento Seguro: Seus dados sao armazenados de forma segura e nao serao compartilhados com terceiros sem seu consentimento explicito.{"\n\n"}
                3. Consentimento: Ao aceitar estes termos, voce concorda com a coleta e tratamento dos seus dados pela profissional Stheffane Santos conforme a Lei Geral de Protecao de Dados (LGPD).{"\n\n"}
                4. Exclusao de Dados: Voce pode solicitar a exclusao total da sua conta e dos seus dados a qualquer momento atraves da aba Configuracoes.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setModalTermosVisible(false)} style={styles.btnFecharTermos}>
              <Text style={styles.btnFecharTermosText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  termosContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%', paddingHorizontal: 10 },
  termosText: { fontSize: 12, color: '#666', flex: 1, marginLeft: 10 },
  termosLink: { color: '#2E7D32', fontWeight: 'bold', textDecorationLine: 'underline' },

  buttonContainer: { width: '100%' },
  mainButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', borderWidth: 1, borderColor: '#FFD700' },
  buttonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#EFEDE7', borderRadius: 20, padding: 25, maxHeight: '80%', borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15, textAlign: 'center' },
  scrollTermos: { flexGrow: 0, marginBottom: 20, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' },
  textoLongoTermos: { fontSize: 14, color: '#555', lineHeight: 22 },
  btnFecharTermos: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnFecharTermosText: { color: '#FFFFFF', fontWeight: 'bold' }
});