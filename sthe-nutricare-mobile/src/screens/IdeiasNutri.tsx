import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Dados Fakes (No futuro viriam do Banco/API)
const RECEITAS = [
  {
    id: '1',
    titulo: 'Crepioca de Frango',
    categoria: 'Café da Manhã',
    tempo: '10 min',
    calorias: '250 kcal',
    imagem: 'https://img.freepik.com/fotos-premium/panquecas-frias-com-recheio-de-frango-e-cogumelos-crepioca-brasileira_121287-175.jpg',
    ingredientes: ['1 ovo', '2 colheres de goma de tapioca', 'Frango desfiado', 'Sal a gosto'],
    preparo: 'Misture o ovo e a goma. Coloque na frigideira. Quando firmar, adicione o frango e feche.'
  },
  {
    id: '2',
    titulo: 'Suco Detox Verde',
    categoria: 'Bebidas',
    tempo: '5 min',
    calorias: '120 kcal',
    imagem: 'https://img.freepik.com/fotos-gratis/smoothie-de-verde-fresco-em-vidro_144627-39396.jpg',
    ingredientes: ['1 folha de couve', '1 maçã', '1 pedaço de gengibre', '200ml de água de coco'],
    preparo: 'Bata tudo no liquidificador por 2 minutos. Coe se preferir e sirva gelado.'
  },
  {
    id: '3',
    titulo: 'Salada de Grão de Bico',
    categoria: 'Almoço',
    tempo: '15 min',
    calorias: '320 kcal',
    imagem: 'https://img.freepik.com/fotos-gratis/salada-de-legumes-fresca-com-grao-de-bico-em-uma-tigela_2829-19642.jpg',
    ingredientes: ['200g grão de bico cozido', 'Tomate cereja', 'Pepino', 'Azeite e Limão'],
    preparo: 'Misture todos os ingredientes em uma tigela. Tempere com azeite, sal e limão.'
  },
];

export function IdeiasNutri() {
  const [modalVisible, setModalVisible] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState<any>(null);

  function abrirReceita(item: any) {
    setReceitaSelecionada(item);
    setModalVisible(true);
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => abrirReceita(item)}>
      <Image source={{ uri: item.imagem }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.categoria}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.iconRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.footerText}>{item.tempo}</Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons name="flame-outline" size={14} color="#E83F5B" />
            <Text style={[styles.footerText, { color: '#E83F5B' }]}>{item.calorias}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ideias da Nutri 💡</Text>
        <Text style={styles.subtitle}>Receitas práticas pro seu dia a dia</Text>
      </View>

      <FlatList
        data={RECEITAS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL DE DETALHES */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {receitaSelecionada && (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: receitaSelecionada.imagem }} style={styles.modalImage} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalCategory}>{receitaSelecionada.categoria}</Text>
              <Text style={styles.modalTitle}>{receitaSelecionada.titulo}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Ionicons name="time" size={20} color="#A555B9" />
                  <Text style={styles.statLabel}>{receitaSelecionada.tempo}</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="flame" size={20} color="#E83F5B" />
                  <Text style={styles.statLabel}>{receitaSelecionada.calorias}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Ingredientes</Text>
              {receitaSelecionada.ingredientes.map((ing: string, index: number) => (
                <Text key={index} style={styles.ingredientText}>• {ing}</Text>
              ))}

              <Text style={styles.sectionTitle}>Modo de Preparo</Text>
              <Text style={styles.preparoText}>{receitaSelecionada.preparo}</Text>
              
              <View style={{height: 50}} />
            </ScrollView>
          </View>
        )}
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#A555B9' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  
  listContent: { padding: 24, paddingTop: 10 },
  
  // Card
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, elevation: 4, overflow: 'hidden' },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 15 },
  tagContainer: { backgroundColor: '#E0F2F1', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  tagText: { color: '#2F9F85', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', gap: 15 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#666', fontWeight: 'bold' },

  // Modal
  modalImage: { width: '100%', height: 300 },
  closeBtn: { position: 'absolute', top: 40, right: 20 },
  modalContent: { flex: 1, backgroundColor: '#FFF', marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 },
  modalCategory: { color: '#2F9F85', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, marginBottom: 5 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 15, marginBottom: 25 },
  statBox: { alignItems: 'center', gap: 5 },
  statLabel: { fontWeight: 'bold', color: '#555' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#A555B9', marginBottom: 10, marginTop: 10 },
  ingredientText: { fontSize: 16, color: '#444', marginBottom: 5, lineHeight: 24 },
  preparoText: { fontSize: 16, color: '#444', lineHeight: 26 },
});