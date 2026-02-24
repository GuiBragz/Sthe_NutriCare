import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// 👇 IMPORTA O NOSSO ARQUIVO CENTRALIZADO
import api from '../services/api'; 

// ❌ REMOVEMOS: import axios ...
// ❌ REMOVEMOS: const API_URL = ...

export function Perfil({ route, navigation }: any) {
  const { usuarioId } = route.params;
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editAltura, setEditAltura] = useState('');
  const [editNascimento, setEditNascimento] = useState(''); 
  const [editObjetivos, setEditObjetivos] = useState('');

  const carregarPerfil = async () => {
    try {
      // 👇 USAMOS api.get NA ROTA '/usuarios/ID'
      const response = await api.get(`/usuarios/${usuarioId}`);
      setPerfil(response.data);
    } catch (error) {
      console.log('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [usuarioId])
  );

  // --- FUNÇÃO DE IDADE BLINDADA 🛡️ ---
  function calcularIdadeReal(dataString: string) {
    if (!dataString) return '--';

    let diaNasc, mesNasc, anoNasc;
    const limpa = dataString.trim();

    try {
      if (limpa.includes('-')) {
        const partes = limpa.split('-');
        if (partes[0].length === 4) { 
          anoNasc = parseInt(partes[0]);
          mesNasc = parseInt(partes[1]) - 1;
          diaNasc = parseInt(partes[2]);
        } else { 
          diaNasc = parseInt(partes[0]);
          mesNasc = parseInt(partes[1]) - 1;
          anoNasc = parseInt(partes[2]);
        }
      } 
      else if (limpa.includes('/')) {
        const partes = limpa.split('/');
        diaNasc = parseInt(partes[0]);
        mesNasc = parseInt(partes[1]) - 1;
        anoNasc = parseInt(partes[2]);
      }
      else {
        return dataString; 
      }

      if (!anoNasc || !mesNasc || !diaNasc) return dataString;

      const hoje = new Date();
      let idade = hoje.getFullYear() - anoNasc;
      const mesAtual = hoje.getMonth();
      const diaAtual = hoje.getDate();

      if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--;
      }

      return `${idade} anos`;

    } catch (e) {
      return dataString;
    }
  }

  function abrirEdicao() {
    if (perfil) {
      setEditNome(perfil.nomeCompleto);
      setEditAltura(perfil.altura ? String(perfil.altura) : '');
      setEditNascimento(perfil.dataNascimento || ''); 
      setEditObjetivos(perfil.objetivos || '');
      setModalVisible(true);
    }
  }

  async function salvarEdicao() {
    try {
      // 👇 USAMOS api.put NA ROTA '/usuarios/ID'
      await api.put(`/usuarios/${usuarioId}`, {
        nome: editNome,
        altura: editAltura,
        objetivos: editObjetivos,
        nascimento: editNascimento,
        sexo: perfil.sexo 
      });
      
      setModalVisible(false);
      Alert.alert("Sucesso", "Perfil atualizado!");
      carregarPerfil(); 
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  }

  function handleLogout() {
    Alert.alert("Sair", "Deseja desconectar?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => navigation.navigate('Welcome') }
    ]);
  }

  if (loading) return <ActivityIndicator size="large" color="#A555B9" style={{flex:1}} />;

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#A555B9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={24} color="#E83F5B" />
          </TouchableOpacity>
        </View>

        {/* Card Principal */}
        <View style={styles.cardProfile}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color="#C8A2C8" />
            <View style={styles.camIcon}>
               <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.name}>{perfil?.nomeCompleto}</Text>
          <Text style={styles.email}>{perfil?.email}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ALTURA</Text>
              <Text style={styles.statValue}>
                {perfil?.altura ? `${perfil.altura} m` : '--'}
              </Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>IDADE</Text>
              <Text style={styles.statValue}>
                {calcularIdadeReal(perfil?.dataNascimento)}
              </Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SEXO</Text>
              <Text style={styles.statValue}>{perfil?.sexo || '--'}</Text>
            </View>
          </View>
        </View>

        {/* Objetivos */}
        <Text style={styles.sectionTitle}>Meus Objetivos</Text>
        <View style={styles.cardInfo}>
          {perfil?.objetivos ? (
            perfil.objetivos.split(',').map((obj: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{marginRight: 5}} />
                <Text style={styles.tagText}>{obj.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={{color: '#999'}}>Nenhum objetivo definido.</Text>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={abrirEdicao}>
          <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Dados</Text>

            <Text style={styles.labelInput}>Nome Completo</Text>
            <TextInput style={styles.input} value={editNome} onChangeText={setEditNome} />
            
            <Text style={styles.labelInput}>Data de Nascimento (DD/MM/AAAA)</Text>
            <TextInput 
              style={styles.input} 
              value={editNascimento} 
              onChangeText={setEditNascimento} 
              placeholder="Ex: 15/05/1999"
              keyboardType="numeric"
            />

            <Text style={styles.labelInput}>Altura (ex: 1.75)</Text>
            <TextInput style={styles.input} value={editAltura} onChangeText={setEditAltura} keyboardType="numeric" />

            <Text style={styles.labelInput}>Objetivos (separe por vírgula)</Text>
            <TextInput style={styles.input} value={editObjetivos} onChangeText={setEditObjetivos} />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={salvarEdicao} style={styles.btnSave}>
                <Text style={styles.btnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 50 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  iconBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, elevation: 2 },
  cardProfile: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 25, elevation: 4 },
  avatarContainer: { marginBottom: 10, position: 'relative' },
  camIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#2F9F85', padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#A555B9', marginBottom: 5, textAlign: 'center' },
  email: { fontSize: 14, color: '#666', marginBottom: 20 },
  divider: { width: '100%', height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 5 },
  statLine: { width: 1, height: '100%', backgroundColor: '#F0F0F0' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 10, marginLeft: 5 },
  cardInfo: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 15, padding: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  tag: { backgroundColor: '#2F9F85', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  tagText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  editButton: { borderWidth: 2, borderColor: '#A555B9', borderRadius: 30, padding: 15, alignItems: 'center', backgroundColor: '#FFF' },
  editButtonText: { color: '#A555B9', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#A555B9', marginBottom: 20, textAlign: 'center' },
  labelInput: { fontWeight: 'bold', color: '#666', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 10, backgroundColor: '#F9F9F9', fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  btnCancel: { flex: 1, alignItems: 'center', padding: 15 },
  btnCancelText: { color: '#666', fontWeight: 'bold' },
  btnSave: { flex: 1, backgroundColor: '#A555B9', borderRadius: 10, alignItems: 'center', padding: 15 },
  btnSaveText: { color: '#FFF', fontWeight: 'bold' }
});