import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export function IdeiasNutri({ route }: any) {
  const usuarioId = route.params?.usuarioId || 1;

  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);

  const [receitaSelecionada, setReceitaSelecionada] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  useFocusEffect(useCallback(() => { carregarFeed(); }, []));

  async function carregarFeed() {
    setLoading(true);
    try {
      const response = await api.get(`/receitas?usuarioId=${usuarioId}`);
      setReceitas(response.data);
    } catch (error) {
      console.log('Erro ao carregar feed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(id: number, index: number) {
    const novasReceitas = [...receitas];
    const receita = novasReceitas[index];
    receita.curtidoPorMim = !receita.curtidoPorMim;
    receita.totalLikes += receita.curtidoPorMim ? 1 : -1;
    setReceitas(novasReceitas);
    try { await api.post(`/receitas/${id}/like`, { usuarioId }); } 
    catch (error) { carregarFeed(); }
  }

  async function handleFavorito(id: number, index: number) {
    const novasReceitas = [...receitas];
    const receita = novasReceitas[index];
    receita.favoritoPorMim = !receita.favoritoPorMim;
    setReceitas(novasReceitas);
    try { await api.post(`/receitas/${id}/favorito`, { usuarioId }); } 
    catch (error) { carregarFeed(); }
  }

  async function abrirReceita(receita: any) {
    setReceitaSelecionada(receita);
    setModalVisible(true);
    carregarComentarios(receita.id);
  }

  async function carregarComentarios(id: number) {
    setLoadingComentarios(true);
    try {
      const response = await api.get(`/receitas/${id}/comentarios`);
      setComentarios(response.data);
    } catch (error) {} 
    finally { setLoadingComentarios(false); }
  }

  async function enviarComentario() {
    if (!novoComentario.trim()) return;
    try {
      const response = await api.post(`/receitas/${receitaSelecionada.id}/comentarios`, { usuarioId, texto: novoComentario });
      setComentarios([...comentarios, response.data]);
      setNovoComentario('');
      setReceitas(receitas.map(r => r.id === receitaSelecionada.id ? { ...r, totalComentarios: r.totalComentarios + 1 } : r));
    } catch (error) { Alert.alert("Erro", "Nao foi possivel comentar."); }
  }

  const receitasFiltradas = receitas.filter(receita => {
    const matchBusca = receita.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchFavorito = mostrarFavoritos ? receita.favoritoPorMim : true;
    return matchBusca && matchFavorito;
  });

  const renderItem = ({ item, index }: any) => (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => abrirReceita(item)}>
        <Image source={{ uri: item.fotoUrl || 'https://via.placeholder.com/300' }} style={styles.cardImage} />
        <View style={styles.badgeCategoria}><Text style={styles.badgeText}>{item.categoria.toUpperCase()}</Text></View>
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        <Text style={styles.cardCalorias}>{item.caloriasTotais} kcal</Text>
        
        <View style={styles.interacoesRow}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id, index)}>
              <Ionicons name={item.curtidoPorMim ? "heart" : "heart-outline"} size={26} color={item.curtidoPorMim ? "#2E7D32" : "#333"} />
              <Text style={styles.actionText}>{item.totalLikes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => abrirReceita(item)}>
              <Ionicons name="chatbubble-outline" size={24} color="#333" />
              <Text style={styles.actionText}>{item.totalComentarios}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleFavorito(item.id, index)}>
            <Ionicons name={item.favoritoPorMim ? "bookmark" : "bookmark-outline"} size={24} color={item.favoritoPorMim ? "#FFD700" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ideias da Nutri</Text>

      <View style={styles.filterContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput style={styles.searchInput} placeholder="Buscar receita..." value={busca} onChangeText={setBusca} />
        </View>
        <TouchableOpacity style={[styles.favFilterBtn, mostrarFavoritos && styles.favFilterBtnActive]} onPress={() => setMostrarFavoritos(!mostrarFavoritos)}>
          <Ionicons name={mostrarFavoritos ? "bookmark" : "bookmark-outline"} size={20} color={mostrarFavoritos ? "#FFFFFF" : "#FFD700"} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={receitasFiltradas}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        {receitaSelecionada && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderImage}>
              <Image source={{ uri: receitaSelecionada.fotoUrl || 'https://via.placeholder.com/300' }} style={styles.modalImage} />
              <View style={styles.modalGradientTop}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>{receitaSelecionada.titulo}</Text>
              <View style={styles.tagsRow}>
                <Text style={styles.tag}>{receitaSelecionada.categoria}</Text>
                <Text style={styles.tag}>{receitaSelecionada.caloriasTotais} kcal</Text>
              </View>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <Text style={styles.textContent}>{receitaSelecionada.ingredientes}</Text>
              <Text style={styles.sectionTitle}>Modo de Preparacao</Text>
              <Text style={styles.textContent}>{receitaSelecionada.modoPreparo}</Text>
              <View style={styles.divider} />
              
              <Text style={styles.sectionTitle}>Comentarios ({comentarios.length})</Text>
              {loadingComentarios ? <ActivityIndicator size="small" color="#2E7D32" /> : comentarios.length === 0 ? (
                <Text style={styles.emptyComentario}>Nenhum comentario ainda.</Text>
              ) : (
                comentarios.map(com => (
                  <View key={com.id} style={styles.comentarioBox}>
                    <View style={[styles.avatarMini, com.usuario?.tipo === 'NUTRICIONISTA' && {backgroundColor: '#2E7D32'}]}>
                      <Ionicons name="person" size={16} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.comentarioNome}>
                        {com.usuario?.nomeCompleto || 'Usuario'} 
                        {com.usuario?.tipo === 'NUTRICIONISTA' && <Text style={{color: '#2E7D32'}}> (Nutri)</Text>}
                      </Text>
                      <Text style={styles.comentarioTexto}>{com.texto}</Text>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} /> 
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput style={styles.commentInput} placeholder="Comente algo..." value={novoComentario} onChangeText={setNovoComentario} />
              <TouchableOpacity style={styles.sendBtn} onPress={enviarComentario}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#EFEDE7' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  filterContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, elevation: 2 },
  searchInput: { flex: 1, height: 45, color: '#333' },
  favFilterBtn: { width: 45, height: 45, backgroundColor: '#FFFFFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#FFD700' },
  favFilterBtnActive: { backgroundColor: '#FFD700' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 25, elevation: 5, overflow: 'hidden' },
  cardImage: { width: '100%', height: 220, backgroundColor: '#EFEDE7' },
  badgeCategoria: { position: 'absolute', top: 15, left: 15, backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cardContent: { padding: 20 },
  cardTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardCalorias: { fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '500' },
  interacoesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EFEDE7', paddingTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeaderImage: { width: '100%', height: 300, position: 'relative' },
  modalImage: { width: '100%', height: '100%' },
  modalGradientTop: { position: 'absolute', top: 0, width: '100%', height: 100, padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.3)' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  modalBody: { flex: 1, padding: 24, marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalTitulo: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  tagsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  tag: { backgroundColor: '#EFEDE7', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  textContent: { fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 25 },
  divider: { height: 1, backgroundColor: '#EFEDE7', marginVertical: 20 },

  emptyComentario: { fontStyle: 'italic', color: '#999', marginBottom: 20 },
  comentarioBox: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  avatarMini: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#CCC', justifyContent: 'center', alignItems: 'center' },
  comentarioNome: { fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 2 },
  comentarioTexto: { color: '#666', fontSize: 14, lineHeight: 20 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#EFEDE7' },
  commentInput: { flex: 1, backgroundColor: '#EFEDE7', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, color: '#333' },
  sendBtn: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});