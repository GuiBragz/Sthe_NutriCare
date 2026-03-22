import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export function NutriIdeias({ route }: any) {
  const usuarioId = route.params?.id || 1;

  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalComentariosVisible, setModalComentariosVisible] = useState(false);
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [calorias, setCalorias] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [modoPreparo, setModoPreparo] = useState('');

  const [receitaAtiva, setReceitaAtiva] = useState<any>(null);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');

  useFocusEffect(useCallback(() => { carregarReceitas(); }, []));

  async function carregarReceitas() {
    setLoading(true);
    try {
      const response = await api.get('/receitas');
      setReceitas(response.data);
    } catch (error) {} finally { setLoading(false); }
  }

  function limparFormulario() {
    setTitulo(''); setCategoria(''); setCalorias('');
    setFotoUrl(''); setIngredientes(''); setModoPreparo('');
  }

  async function salvarReceita() {
    if (!titulo || !ingredientes || !modoPreparo || !calorias || !categoria) {
      return Alert.alert('Atenção', 'Preencha todos os campos obrigatórios!');
    }
    setLoadingSubmit(true);
    try {
      await api.post('/receitas', { titulo, categoria, caloriasTotais: Number(calorias), fotoUrl, ingredientes, modoPreparo });
      Alert.alert('Sucesso!', 'Receita publicada!');
      setModalVisible(false);
      limparFormulario();
      carregarReceitas();
    } catch (error) {} finally { setLoadingSubmit(false); }
  }

  function confirmarExclusao(id: number) {
    Alert.alert('Excluir Receita', 'Tem certeza que deseja apagar esta receita?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim, Apagar', style: 'destructive', onPress: async () => {
        await api.delete(`/receitas/${id}`);
        carregarReceitas();
      }}
    ]);
  }

  async function abrirComentarios(receita: any) {
    setReceitaAtiva(receita);
    setModalComentariosVisible(true);
    try {
      const response = await api.get(`/receitas/${receita.id}/comentarios`);
      setComentarios(response.data);
    } catch (error) {}
  }

  async function enviarComentario() {
    if (!novoComentario.trim()) return;
    try {
      const response = await api.post(`/receitas/${receitaAtiva.id}/comentarios`, { usuarioId, texto: novoComentario });
      setComentarios([...comentarios, response.data]);
      setNovoComentario('');
      carregarReceitas();
    } catch (error) {}
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.fotoUrl || 'https://via.placeholder.com/300' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategoria}>{item.categoria.toUpperCase()}</Text>
          <TouchableOpacity onPress={() => confirmarExclusao(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        
        <View style={styles.cardMetricas}>
          <Text style={styles.metricaText}>🔥 {item.caloriasTotais} kcal</Text>
          <Text style={styles.metricaText}>❤️ {item.totalLikes} curtidas</Text>
          <TouchableOpacity onPress={() => abrirComentarios(item)}>
            <Text style={[styles.metricaText, { color: '#B8860B', fontWeight: 'bold' }]}>💬 {item.totalComentarios} comentários</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Receitas</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => { limparFormulario(); setModalVisible(true); }}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 50}} /> : (
        <FlatList 
          data={receitas} renderItem={renderItem} keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma receita publicada.</Text>}
        />
      )}

      {/* --- MODAL DE CRIAR RECEITA --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Receita</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={32} color="#CCC" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Título da Receita *</Text>
              <TextInput style={styles.input} placeholder="Ex: Panqueca de Aveia" value={titulo} onChangeText={setTitulo} />
              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Categoria *</Text>
                  <TextInput style={styles.input} placeholder="Ex: Café da Manhã" value={categoria} onChangeText={setCategoria} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Calorias (kcal) *</Text>
                  <TextInput style={styles.input} placeholder="Ex: 250" keyboardType="numeric" value={calorias} onChangeText={setCalorias} />
                </View>
              </View>
              <Text style={styles.label}>Link da Foto (URL)</Text>
              <TextInput style={styles.input} placeholder="https://site.com/foto.jpg" value={fotoUrl} onChangeText={setFotoUrl} />
              <Text style={styles.label}>Ingredientes *</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={ingredientes} onChangeText={setIngredientes} />
              <Text style={styles.label}>Modo de Preparo *</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={modoPreparo} onChangeText={setModoPreparo} />
              <TouchableOpacity style={styles.btnSalvar} onPress={salvarReceita} disabled={loadingSubmit}>
                {loadingSubmit ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSalvarText}>PUBLICAR RECEITA</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: COMENTÁRIOS PARA A NUTRI RESPONDER --- */}
      <Modal visible={modalComentariosVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentários</Text>
              <TouchableOpacity onPress={() => setModalComentariosVisible(false)}><Ionicons name="close-circle" size={32} color="#CCC" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {comentarios.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Nenhum comentário ainda.</Text>
              ) : (
                comentarios.map(com => (
                  <View key={com.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                    <View style={[{ width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#CCC', justifyContent: 'center', alignItems: 'center' }, com.usuario?.tipo === 'NUTRICIONISTA' && {backgroundColor: '#2E7D32'}]}>
                      <Ionicons name="person" size={16} color="#FFF" />
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' }}>
                      <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 13, marginBottom: 2 }}>
                        {com.usuario?.nomeCompleto || 'Usuário'} 
                        {com.usuario?.tipo === 'NUTRICIONISTA' && <Text style={{color: '#2E7D32'}}> (Você)</Text>}
                      </Text>
                      <Text style={{ color: '#555', fontSize: 13 }}>{com.texto}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderColor: '#FFD700' }}>
              <TextInput 
                style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, color: '#333', borderWidth: 1, borderColor: '#FFD700' }} 
                placeholder="Responda como Nutri..." 
                value={novoComentario} onChangeText={setNovoComentario} 
              />
              <TouchableOpacity style={{ backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }} onPress={enviarComentario}>
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32' },
  btnAdd: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#FFD700' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  card: { backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, elevation: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#FFD700' },
  cardImage: { width: '100%', height: 150, backgroundColor: '#EEE' },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardCategoria: { fontSize: 10, fontWeight: 'bold', color: '#B8860B', letterSpacing: 1 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cardMetricas: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  metricaText: { fontSize: 12, color: '#666', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#EFEDE7', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '90%', borderWidth: 1, borderColor: '#FFD700' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  
  label: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 5, fontSize: 12 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#FFD700', color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSalvar: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});