import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

// ⚠️ CONFIRA SEU IP
const API_URL = 'http://192.168.1.3:3000';

export function PlanoAlimentar({ route, navigation }: any) {
  const { usuarioId } = route.params;
  const [plano, setPlano] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function carregarPlano() {
        try {
          const response = await axios.get(`${API_URL}/planos/${usuarioId}`);
          setPlano(response.data);
        } catch (error) {
          setPlano(null); // Nenhum plano encontrado
        } finally {
          setLoading(false);
        }
      }
      carregarPlano();
    }, [usuarioId])
  );

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#A555B9" />
          </TouchableOpacity>
          <Text style={styles.title}>Meu Plano 🥗</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#A555B9" style={{marginTop: 50}} />
        ) : plano ? (
          <View style={styles.cardPlano}>
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant" size={24} color="#FFF" />
              <Text style={styles.cardTitle}>{plano.titulo}</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.descricao}>{plano.descricao}</Text>
              
              {/* Se tivesse link do PDF, apareceria aqui */}
              {plano.arquivoUrl && (
                <TouchableOpacity style={styles.pdfButton}>
                  <Ionicons name="document-text" size={20} color="#A555B9" />
                  <Text style={styles.pdfText}>Baixar PDF Completo</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.footerData}>
              Atualizado em: {new Date(plano.dataUpload).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Image 
              source={{uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png'}} 
              style={{width: 100, height: 100, opacity: 0.5}} 
            />
            <Text style={styles.emptyText}>Você ainda não possui um plano alimentar ativo.</Text>
            <Text style={styles.emptySub}>Agende uma consulta para montar sua dieta!</Text>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, marginRight: 15, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  cardPlano: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 4 },
  cardHeader: { 
    backgroundColor: '#2F9F85', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 10 
  },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  cardBody: { padding: 20 },
  descricao: { fontSize: 16, color: '#333', lineHeight: 24 },
  
  pdfButton: { 
    marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 12, borderWidth: 1, borderColor: '#A555B9', borderRadius: 10, gap: 8 
  },
  pdfText: { color: '#A555B9', fontWeight: 'bold' },

  footerData: { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 15 },

  emptyState: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 20, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#999', marginTop: 10, textAlign: 'center' }
});