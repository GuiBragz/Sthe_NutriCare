import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function Home({ route, navigation }: any) {
  // Pegamos o nome e o ID do usuário que veio do Login
  // Se não vier nada, assume ID 0 (que vai dar erro no agendamento se não arrumarmos o login depois)
  const { nome, id } = route.params || { nome: 'Visitante', id: 0 };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, {nome}! 👋</Text>
      <Text style={styles.subtitle}>Seu painel nutricional</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima Consulta</Text>
        <Text style={styles.cardText}>Nenhuma agendada</Text>
      </View>

      {/* --- BOTÃO NOVO: AGENDAR --- */}
      <TouchableOpacity 
        style={styles.buttonSchedule} 
        onPress={() => navigation.navigate('Agendamento', { usuarioId: id })}
      >
        <Text style={styles.buttonText}>📅 Agendar Nova Consulta</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonLogout} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 24,
    justifyContent: 'center',
  },
  greeting: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#E1E1E6',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#202024',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#04D361',
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  cardText: {
    color: '#C4C4CC',
  },
  // --- ESTILO NOVO ---
  buttonSchedule: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#04D361', // Verde destaque
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10, // Espaço entre os botões
  },
  buttonLogout: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#29292E',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});