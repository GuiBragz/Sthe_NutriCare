import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const DICAS = [
  "Beber agua antes das refeicoes ajuda na digestao.",
  "Descasque mais, desembale menos.",
  "Dormir bem e tao importante quanto treinar.",
  "Evite telas 1 hora antes de dormir.",
  "Coma devagar e mastigue bem os alimentos."
];

export function FeedHome({ route }: any) {
  const { nome, usuarioId } = route.params || { nome: 'Visitante', usuarioId: 1 };
  const navigation = useNavigation<any>();

  const [caloriasConsumidas, setCaloriasConsumidas] = useState(0);
  const [caloriasQueimadas, setCaloriasQueimadas] = useState(0);
  const [agua, setAgua] = useState(0);
  const [dica, setDica] = useState('');
  const [loading, setLoading] = useState(true);
  
  const META_CALORIAS = 2000;
  const META_AGUA = 8; 

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoInput, setTipoInput] = useState<'comida' | 'exercicio'>('comida');
  const [valorInput, setValorInput] = useState('');

  const carregarDadosDoDia = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/diario/hoje/${usuarioId}`);
      if (response.data) {
        setCaloriasConsumidas(response.data.caloriasConsumidas || 0);
        setCaloriasQueimadas(response.data.caloriasQueimadas || 0);
        setAgua(Math.floor(response.data.aguaConsumida / 250)); 
      }
    } catch (error) {
      console.log("Diário de hoje ainda não criado.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDadosDoDia();
      setDica(DICAS[Math.floor(Math.random() * DICAS.length)]);
    }, [])
  );

  const handleAdicionar = async () => {
    const valor = parseInt(valorInput);
    if (!valor || isNaN(valor)) return Alert.alert("Ops", "Digite um numero!");

    try {
      await api.post('/diario/atualizar-rapido', {
        usuarioId,
        tipo: tipoInput,
        valor: valor
      });

      if (tipoInput === 'comida') setCaloriasConsumidas(prev => prev + valor);
      else setCaloriasQueimadas(prev => prev + valor);
      
      setValorInput('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar no banco.");
    }
  };

  const atualizarAgua = async (novoValor: number) => {
    const totalMl = novoValor * 250;
    setAgua(novoValor);
    try {
      await api.post('/diario/atualizar-agua', { usuarioId, aguaConsumida: totalMl });
    } catch (e) {
      console.log("Erro ao salvar água");
    }
  };

  const saldo = caloriasConsumidas - caloriasQueimadas;
  const porcentagem = Math.min((saldo / META_CALORIAS) * 100, 100);
  const corBarra = porcentagem >= 100 ? '#D32F2F' : '#2E7D32'; 

  if (loading) return <ActivityIndicator size="large" color="#2E7D32" style={{flex: 1}} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá,</Text>
            <Text style={styles.nomeUser}>{nome.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('RegistroDesempenho', { usuarioId })}>
            <View style={styles.proBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.proText}>REGISTRO PRO</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: `${porcentagem}%`, backgroundColor: corBarra }]} />
            </View>
            <Text style={styles.chartLabel}>{saldo} / {META_CALORIAS} kcal</Text>
          </View>

          <View style={styles.rowStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CONSUMIDO</Text>
              <Text style={[styles.statValue, { color: '#2E7D32' }]}>{caloriasConsumidas}</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>QUEIMADO</Text>
              <Text style={[styles.statValue, { color: '#D32F2F' }]}>{caloriasQueimadas}</Text>
            </View>
          </View>

          <View style={styles.rowButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]}
              onPress={() => { setTipoInput('comida'); setModalVisible(true); }}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.btnText}>Comi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]}
              onPress={() => { setTipoInput('exercicio'); setModalVisible(true); }}
            >
              <Ionicons name="remove" size={20} color="#FFFFFF" />
              <Text style={styles.btnText}>Queimei</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>HIDRATAÇÃO</Text>
            <Text style={{marginLeft: 'auto', color: '#666'}}>{agua}/{META_AGUA} copos</Text>
          </View>

          <View style={styles.waterControls}>
            <TouchableOpacity onPress={() => atualizarAgua(Math.max(0, agua - 1))} style={styles.waterBtnMini}>
              <Ionicons name="remove" size={24} color="#2E7D32" />
            </TouchableOpacity>
            
            <View style={styles.cupsContainer}>
              {[...Array(META_AGUA)].map((_, i) => (
                <Ionicons key={i} name={i < agua ? "water" : "water-outline"} size={28} color="#2E7D32" style={{margin: 2}} />
              ))}
            </View>

            <TouchableOpacity onPress={() => atualizarAgua(agua + 1)} style={styles.waterBtnMini}>
              <Ionicons name="add" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={30} color="#FFFFFF" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.tipTitle}>DICA DA NUTRI</Text>
            <Text style={styles.tipText}>"{dica}"</Text>
          </View>
        </View>

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{tipoInput === 'comida' ? 'Adicionar Calorias' : 'Registrar Exercicio'}</Text>
              <TextInput style={styles.input} placeholder="Ex: 300" keyboardType="numeric" value={valorInput} onChangeText={setValorInput} autoFocus />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}><Text style={{color: '#666'}}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleAdicionar} style={styles.modalBtnConfirm}><Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>Salvar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  saudacao: { fontSize: 18, color: '#666' },
  nomeUser: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  proBadge: { backgroundColor: '#2E7D32', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, gap: 5, elevation: 3, borderWidth: 1, borderColor: '#FFD700' },
  proText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, borderWidth: 1, borderColor: '#FFD700' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginLeft: 10, letterSpacing: 1 },
  chartContainer: { marginBottom: 20 },
  barBackground: { height: 15, backgroundColor: '#EFEDE7', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  chartLabel: { textAlign: 'right', marginTop: 5, color: '#999', fontSize: 12 },
  rowStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#999', fontWeight: 'bold' },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  verticalLine: { width: 1, height: '100%', backgroundColor: '#EFEDE7' },
  rowButtons: { flexDirection: 'row', gap: 15 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, gap: 5 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold' },
  waterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterBtnMini: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFEDE7', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD700' },
  cupsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', flex: 1, paddingHorizontal: 10 },
  tipCard: { flexDirection: 'row', backgroundColor: '#2E7D32', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 4, borderWidth: 1, borderColor: '#FFD700' },
  tipIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15, marginRight: 15 },
  tipTitle: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  tipText: { color: '#FFFFFF', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, elevation: 5, borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#FFD700', borderRadius: 10, padding: 15, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtnCancel: { padding: 10 },
  modalBtnConfirm: { backgroundColor: '#2E7D32', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }
});