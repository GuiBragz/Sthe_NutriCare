import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Dicas aleatórias
const DICAS = [
  "Beber água antes das refeições ajuda na digestão. 💧",
  "Descasque mais, desembale menos. 🍎",
  "Dormir bem é tão importante quanto treinar. 😴",
  "Evite telas 1 hora antes de dormir. 📱",
  "Coma devagar e mastigue bem os alimentos. 🥗",
  "Troque o elevador pela escada hoje! 🏃‍♂️",
  "O estresse aumenta o cortisol e atrapalha o emagrecimento. Respire! 🧘",
  "Vegetais verdes escuros são ricos em ferro e cálcio. 🥦"
];

export function FeedHome({ route }: any) {
  const { nome } = route.params || { nome: 'Visitante' };
  const navigation = useNavigation();

  // Estados do Dia
  const [caloriasConsumidas, setCaloriasConsumidas] = useState(0);
  const [caloriasQueimadas, setCaloriasQueimadas] = useState(0);
  const [agua, setAgua] = useState(0);
  const [dica, setDica] = useState('');
  
  // Meta Diária (Poderia vir do banco depois)
  const META_CALORIAS = 2000;
  const META_AGUA = 8; // copo de 250ml

  // Controle dos Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoInput, setTipoInput] = useState<'comida' | 'exercicio'>('comida');
  const [valorInput, setValorInput] = useState('');

  useEffect(() => {
    // Escolhe uma dica aleatória ao abrir
    const randomTip = DICAS[Math.floor(Math.random() * DICAS.length)];
    setDica(randomTip);
  }, []);

  // Define saudação
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // Lógica de Adicionar
  const handleAdicionar = () => {
    const valor = parseInt(valorInput);
    if (!valor || isNaN(valor)) {
      Alert.alert("Ops", "Digite um número válido!");
      return;
    }

    if (tipoInput === 'comida') {
      setCaloriasConsumidas(prev => prev + valor);
    } else {
      setCaloriasQueimadas(prev => prev + valor);
    }
    
    setValorInput('');
    setModalVisible(false);
  };

  // Cálculo para o Gráfico (Barra de Progresso)
  const saldo = caloriasConsumidas - caloriasQueimadas;
  const porcentagem = Math.min((saldo / META_CALORIAS) * 100, 100);
  const corBarra = porcentagem > 100 ? '#E83F5B' : '#2F9F85'; // Fica vermelho se estourar a meta

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* --- CABEÇALHO --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>{saudacao},</Text>
            <Text style={styles.nomeUser}>{nome.split(' ')[0]}!</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>Hoje</Text>
          </View>
        </View>

        {/* --- CARD CALORIAS (GRÁFICO) --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color="#FF9966" />
            <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
          </View>

          {/* Gráfico de Barra */}
          <View style={styles.chartContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: `${porcentagem}%`, backgroundColor: corBarra }]} />
            </View>
            <Text style={styles.chartLabel}>
              {saldo} / {META_CALORIAS} kcal
            </Text>
          </View>

          <View style={styles.rowStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CONSUMIDO</Text>
              <Text style={[styles.statValue, { color: '#2F9F85' }]}>{caloriasConsumidas}</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>QUEIMADO</Text>
              <Text style={[styles.statValue, { color: '#E83F5B' }]}>{caloriasQueimadas}</Text>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.rowButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#2F9F85' }]}
              onPress={() => { setTipoInput('comida'); setModalVisible(true); }}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.btnText}>Comi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#E83F5B' }]}
              onPress={() => { setTipoInput('exercicio'); setModalVisible(true); }}
            >
              <Ionicons name="remove" size={20} color="#FFF" />
              <Text style={styles.btnText}>Queimei</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- CARD ÁGUA --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color="#59A5D8" />
            <Text style={styles.cardTitle}>HIDRATAÇÃO</Text>
            <Text style={{marginLeft: 'auto', color: '#666'}}>{agua}/{META_AGUA} copos</Text>
          </View>

          <View style={styles.waterControls}>
            <TouchableOpacity onPress={() => setAgua(prev => Math.max(0, prev - 1))} style={styles.waterBtnMini}>
              <Ionicons name="remove" size={24} color="#59A5D8" />
            </TouchableOpacity>
            
            {/* Visualização dos Copos */}
            <View style={styles.cupsContainer}>
              {[...Array(META_AGUA)].map((_, i) => (
                <Ionicons 
                  key={i} 
                  name={i < agua ? "water" : "water-outline"} 
                  size={28} 
                  color="#59A5D8" 
                  style={{margin: 2}}
                />
              ))}
            </View>

            <TouchableOpacity onPress={() => setAgua(prev => prev + 1)} style={styles.waterBtnMini}>
              <Ionicons name="add" size={24} color="#59A5D8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- CARD DICA --- */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={30} color="#FFF" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.tipTitle}>DICA DA NUTRI</Text>
            <Text style={styles.tipText}>"{dica}"</Text>
          </View>
        </View>

        {/* --- MODAL PARA INPUT --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {tipoInput === 'comida' ? 'Adicionar Calorias 🍔' : 'Registrar Exercício 🏃‍♂️'}
              </Text>
              
              <TextInput 
                style={styles.input}
                placeholder="Ex: 300"
                keyboardType="numeric"
                value={valorInput}
                onChangeText={setValorInput}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}>
                  <Text style={{color: '#666'}}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAdicionar} style={styles.modalBtnConfirm}>
                  <Text style={{color: '#FFF', fontWeight: 'bold'}}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  saudacao: { fontSize: 18, color: '#666' },
  nomeUser: { fontSize: 28, fontWeight: 'bold', color: '#A555B9' },
  dateBadge: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, elevation: 2 },
  dateText: { color: '#A555B9', fontWeight: 'bold' },

  // Cards
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10, letterSpacing: 1 },

  // Gráfico Barra
  chartContainer: { marginBottom: 20 },
  barBackground: { height: 15, backgroundColor: '#F0F0F0', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  chartLabel: { textAlign: 'right', marginTop: 5, color: '#999', fontSize: 12 },

  rowStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#999', fontWeight: 'bold' },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  verticalLine: { width: 1, height: '100%', backgroundColor: '#EEE' },

  rowButtons: { flexDirection: 'row', gap: 15 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, gap: 5 },
  btnText: { color: '#FFF', fontWeight: 'bold' },

  // Água
  waterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterBtnMini: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center' },
  cupsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', flex: 1, paddingHorizontal: 10 },

  // Dica
  tipCard: { 
    flexDirection: 'row', backgroundColor: '#A555B9', borderRadius: 20, padding: 20, 
    alignItems: 'center', elevation: 4 
  },
  tipIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15, marginRight: 15 },
  tipTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  tipText: { color: '#FFF', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 15, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtnCancel: { padding: 10 },
  modalBtnConfirm: { backgroundColor: '#2F9F85', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }
});