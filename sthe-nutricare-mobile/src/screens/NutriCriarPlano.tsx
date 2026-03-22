import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export function NutriCriarPlano({ route, navigation }: any) {
  const { pacienteId, pacienteNome } = route.params || { pacienteId: 0, pacienteNome: 'Paciente' };

  const [planoId, setPlanoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarPlanoAtual();
    }, [])
  );

  async function carregarPlanoAtual() {
    setBuscando(true);
    try {
      const response = await api.get(`/planos/${pacienteId}`);
      if (response.data && response.data.id) {
        setPlanoId(response.data.id);
        setTitulo(response.data.titulo);
        setDescricao(response.data.descricao);
      }
    } catch (error) {
      console.log('Paciente ainda não tem plano.');
    } finally {
      setBuscando(false);
    }
  }

  async function handleSalvarPlano() {
    if (!titulo.trim() || !descricao.trim()) {
      return Alert.alert('Atencao', 'Preencha o titulo e a descricao da dieta.');
    }

    setLoading(true);
    try {
      if (planoId) {
        await api.put(`/planos/${planoId}`, { titulo, descricao });
        Alert.alert('Atualizado!', 'O plano alimentar foi atualizado com sucesso!');
      } else {
        await api.post('/planos', { usuarioId: pacienteId, titulo, descricao });
        Alert.alert('Sucesso!', 'Plano alimentar enviado para o paciente!');
      }
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel salvar a dieta.');
    } finally {
      setLoading(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Apagar Dieta",
      "Tem certeza que deseja apagar essa dieta? O paciente nao tera mais acesso a ela.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, apagar", style: 'destructive',
          onPress: excluirPlano
        }
      ]
    );
  }

  async function excluirPlano() {
    if (!planoId) return;
    setLoading(true);
    try {
      await api.delete(`/planos/${planoId}`);
      Alert.alert('Excluido', 'Plano apagado com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel excluir.');
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{planoId ? 'Editar Dieta' : 'Nova Dieta'}</Text>
            <Text style={styles.subtitle}>Paciente: {pacienteNome}</Text>
          </View>
        </View>

        {buscando ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.label}>Titulo do Plano</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Plano Hipertrofia - Março/2026" 
              placeholderTextColor="#999"
              value={titulo} 
              onChangeText={setTitulo} 
            />

            <Text style={styles.label}>Refeicoes e Orientacoes</Text>
            <Text style={styles.helperText}>O paciente podera visualizar e gerar um PDF desta dieta.</Text>
            
            <TextInput 
              style={styles.textArea} 
              placeholder="CAFE DA MANHA:&#10;- 2 ovos mexidos..." 
              placeholderTextColor="#999"
              multiline={true} 
              textAlignVertical="top" 
              value={descricao} 
              onChangeText={setDescricao} 
            />

            <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarPlano} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Ionicons name={planoId ? "sync" : "send"} size={20} color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={styles.btnText}>{planoId ? 'ATUALIZAR DIETA' : 'ENVIAR DIETA'}</Text>
                </>
              )}
            </TouchableOpacity>

            {planoId && (
              <TouchableOpacity style={styles.btnExcluir} onPress={confirmarExclusao} disabled={loading}>
                <Ionicons name="trash-outline" size={20} color="#D32F2F" style={{ marginRight: 10 }} />
                <Text style={styles.btnExcluirText}>EXCLUIR DIETA</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, paddingBottom: 10 },
  backBtn: { 
    padding: 8, 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    marginRight: 15, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 14, color: '#666' },
  content: { padding: 24, paddingBottom: 50 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },
  helperText: { fontSize: 12, color: '#666', marginBottom: 15, fontStyle: 'italic' },
  input: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#FFD700', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 20, 
    color: '#333', 
    elevation: 1 
  },
  textArea: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#FFD700', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    minHeight: 300, 
    marginBottom: 30, 
    color: '#333', 
    elevation: 1 
  },
  btnSalvar: { 
    backgroundColor: '#2E7D32', 
    flexDirection: 'row', 
    height: 55, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 3, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  btnExcluir: { 
    flexDirection: 'row', 
    height: 55, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#D32F2F', 
    backgroundColor: 'transparent' 
  },
  btnExcluirText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 }
});