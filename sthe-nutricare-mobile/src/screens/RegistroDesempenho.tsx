import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export function RegistroDesempenho({ route, navigation }: any) {
  const usuarioId = route.params?.usuarioId || 1;
  
  const [layout, setLayout] = useState<'SIMPLES' | 'COMPLEXO' | null>(null);
  const [loading, setLoading] = useState(false);

  const [aguaSimples, setAguaSimples] = useState(0);
  const [caloriasSimples, setCaloriasSimples] = useState('');
  
  const [aguaComplexo, setAguaComplexo] = useState('');
  const [nomeRefeicao, setNomeRefeicao] = useState('');
  const [caloriasRefeicao, setCaloriasRefeicao] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carboidratos, setCarboidratos] = useState('');
  const [gorduras, setGorduras] = useState('');
  const [refeicoes, setRefeicoes] = useState<any[]>([]);

  function adicionarRefeicao() {
    if (!nomeRefeicao || !caloriasRefeicao) {
      return Alert.alert("Atencao", "Preencha pelo menos o nome e as calorias da refeicao.");
    }
    
    const nova = {
      nome: nomeRefeicao,
      calorias: parseInt(caloriasRefeicao) || 0,
      proteinas: parseFloat(proteinas) || 0,
      carboidratos: parseFloat(carboidratos) || 0,
      gorduras: parseFloat(gorduras) || 0
    };

    setRefeicoes([...refeicoes, nova]);
    setNomeRefeicao('');
    setCaloriasRefeicao('');
    setProteinas('');
    setCarboidratos('');
    setGorduras('');
  }

  function removerRefeicao(index: number) {
    const novaLista = [...refeicoes];
    novaLista.splice(index, 1);
    setRefeicoes(novaLista);
  }

  async function salvarRegistro() {
    setLoading(true);
    try {
      const payload = {
        usuarioId,
        layoutUsado: layout,
        aguaConsumida: layout === 'SIMPLES' ? (aguaSimples * 250) : (parseInt(aguaComplexo) || 0),
        caloriasConsumidas: layout === 'SIMPLES' ? (parseInt(caloriasSimples) || 0) : refeicoes.reduce((acc, curr) => acc + curr.calorias, 0),
        refeicoes: layout === 'COMPLEXO' ? refeicoes : []
      };

      await api.post('/diario', payload);
      Alert.alert("Sucesso", "Registro salvo com sucesso.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel salvar o registro de hoje.");
    } finally {
      setLoading(false);
    }
  }

  if (!layout) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.title}>Como deseja registrar hoje?</Text>
        </View>

        <View style={styles.selectionContainer}>
          <TouchableOpacity style={styles.layoutCard} onPress={() => setLayout('SIMPLES')}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.layoutTitle}>Registro Rapido</Text>
            <Text style={styles.layoutDesc}>Apenas calorias totais e copos de agua. Ideal para dias corridos.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.layoutCard} onPress={() => setLayout('COMPLEXO')}>
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.layoutTitle}>Registro Detalhado</Text>
            <Text style={styles.layoutDesc}>Adicione cada refeicao, macronutrientes e a quantidade exata de agua em ml.</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setLayout(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>{layout === 'SIMPLES' ? 'Registro Rapido' : 'Registro Detalhado'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {layout === 'SIMPLES' && (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calorias Consumidas Hoje (kcal)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="Ex: 1850" 
                value={caloriasSimples} 
                onChangeText={setCaloriasSimples} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Copos de Agua (250ml)</Text>
              <View style={styles.waterControls}>
                <TouchableOpacity onPress={() => setAguaSimples(prev => Math.max(0, prev - 1))} style={styles.waterBtnMini}>
                  <Ionicons name="remove" size={24} color="#2E7D32" />
                </TouchableOpacity>
                <Text style={styles.waterText}>{aguaSimples}</Text>
                <TouchableOpacity onPress={() => setAguaSimples(prev => prev + 1)} style={styles.waterBtnMini}>
                  <Ionicons name="add" size={24} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {layout === 'COMPLEXO' && (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Agua Consumida Hoje (ml)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="Ex: 2500" 
                value={aguaComplexo} 
                onChangeText={setAguaComplexo} 
              />
            </View>

            <Text style={styles.sectionTitle}>Adicionar Refeicao</Text>
            <View style={styles.mealForm}>
              <TextInput style={styles.input} placeholder="Nome (Ex: Almoço)" value={nomeRefeicao} onChangeText={setNomeRefeicao} />
              <TextInput style={styles.input} placeholder="Calorias (kcal)" keyboardType="numeric" value={caloriasRefeicao} onChangeText={setCaloriasRefeicao} />
              
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 5 }]} placeholder="Carbo (g)" keyboardType="numeric" value={carboidratos} onChangeText={setCarboidratos} />
                <TextInput style={[styles.input, { flex: 1, marginHorizontal: 5 }]} placeholder="Prot (g)" keyboardType="numeric" value={proteinas} onChangeText={setProteinas} />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 5 }]} placeholder="Gord (g)" keyboardType="numeric" value={gorduras} onChangeText={setGorduras} />
              </View>

              <TouchableOpacity style={styles.btnAddMeal} onPress={adicionarRefeicao}>
                <Text style={styles.btnAddMealText}>INCLUIR REFEICAO</Text>
              </TouchableOpacity>
            </View>

            {refeicoes.length > 0 && (
              <View style={styles.mealList}>
                <Text style={styles.sectionTitle}>Refeicoes Registradas</Text>
                {refeicoes.map((ref, index) => (
                  <View key={index} style={styles.mealItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealName}>{ref.nome}</Text>
                      <Text style={styles.mealMacros}>{ref.calorias} kcal | C: {ref.carboidratos}g | P: {ref.proteinas}g | G: {ref.gorduras}g</Text>
                    </View>
                    <TouchableOpacity onPress={() => removerRefeicao(index)}>
                      <Ionicons name="trash-outline" size={24} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.btnSalvar} onPress={salvarRegistro} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnSalvarText}>FINALIZAR REGISTRO</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#FFD700' },
  backBtn: { padding: 8, backgroundColor: '#EFEDE7', borderRadius: 10, marginRight: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', flex: 1 },
  
  selectionContainer: { flex: 1, padding: 24, justifyContent: 'center', gap: 20 },
  layoutCard: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#FFD700', elevation: 3 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  layoutTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  layoutDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  content: { padding: 24, paddingBottom: 100 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, padding: 15, fontSize: 16, color: '#333', marginBottom: 10 },
  
  waterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#FFD700' },
  waterBtnMini: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFEDE7', alignItems: 'center', justifyContent: 'center' },
  waterText: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', marginHorizontal: 30 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginTop: 10, marginBottom: 15 },
  mealForm: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#FFD700', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnAddMeal: { backgroundColor: '#EFEDE7', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5, borderWidth: 1, borderColor: '#2E7D32' },
  btnAddMealText: { color: '#2E7D32', fontWeight: 'bold' },

  mealList: { marginBottom: 20 },
  mealItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EFEDE7' },
  mealName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  mealMacros: { fontSize: 12, color: '#666', marginTop: 4 },

  btnSalvar: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#FFD700' },
  btnSalvarText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});