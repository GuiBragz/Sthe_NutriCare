import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

export function PlanoAlimentar({ route, navigation }: any) {
  const usuarioId = route.params?.usuarioId || 1;

  const [plano, setPlano] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPlano();
    }, [usuarioId])
  );

  async function carregarPlano() {
    setLoading(true);
    try {
      const response = await api.get(`/planos/${usuarioId}`);
      if (response.data && response.data.id) {
        setPlano(response.data);
      } else {
        setPlano(null);
      }
    } catch (error) {
      setPlano(null); 
    } finally {
      setLoading(false);
    }
  }

  async function gerarECompartilharPDF() {
    if (!plano) return;
    setGerandoPDF(true);

    try {
      const textoFormatadoHTML = plano.descricao.replace(/\n/g, '<br/>');

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; background-color: #EFEDE7; }
              .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #B8860B; }
              .logo { font-size: 32px; font-weight: bold; color: #2E7D32; margin-bottom: 5px; }
              .subtitle { font-size: 16px; color: #666; }
              .title { font-size: 24px; color: #2E7D32; margin-bottom: 20px; text-transform: uppercase; border-left: 5px solid #FFD700; padding-left: 15px; }
              .content { font-size: 16px; line-height: 1.6; background: #FFF; padding: 20px; border-radius: 10px; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Sthe NutriCare</div>
              <div class="subtitle">Plano Alimentar Individualizado</div>
            </div>
            
            <div class="title">${plano.titulo}</div>
            
            <div class="content">
              ${textoFormatadoHTML}
            </div>

            <div class="footer">
              Gerado pelo app Sthe NutriCare - Acompanhamento Nutricional
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF da sua dieta.');
    } finally {
      setGerandoPDF(false);
    }
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Meu Plano</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
      ) : plano ? (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.planoCard}>
              <View style={styles.planoHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="restaurant" size={20} color="#FFF" />
                </View>
                <Text style={styles.planoTitle}>{plano.titulo}</Text>
              </View>
              
              <View style={styles.divider} />

              <Text style={styles.planoDescricao}>{plano.descricao}</Text>
            </View>
          </ScrollView>

          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.pdfBtn} 
              onPress={gerarECompartilharPDF}
              disabled={gerandoPDF}
            >
              {gerandoPDF ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-download" size={22} color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={styles.pdfBtnText}>BAIXAR DIETA EM PDF</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#B8860B" />
          <Text style={styles.emptyTitle}>Nenhuma dieta ainda</Text>
          <Text style={styles.emptyText}>
            A sua nutricionista ainda não disponibilizou o seu plano alimentar. Fique de olho!
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#FFD700' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  
  content: { padding: 20, paddingBottom: 120 },
  planoCard: { 
    backgroundColor: '#FFF', 
    padding: 25, 
    borderRadius: 20, 
    elevation: 4, 
    borderWidth: 1, 
    borderColor: '#FFD700' 
  },
  planoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: { backgroundColor: '#2E7D32', padding: 8, borderRadius: 15, marginRight: 12 },
  planoTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  divider: { height: 1, backgroundColor: '#EFEDE7', marginBottom: 20 },
  planoDescricao: { fontSize: 16, color: '#444', lineHeight: 26 },
  
  footerContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  pdfBtn: { 
    backgroundColor: '#2E7D32', 
    flexDirection: 'row', 
    height: 60, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  pdfBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginTop: 20, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#666', fontSize: 15, lineHeight: 22 }
});