import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- IMPORTAÇÃO DAS TELAS ---

// Telas de Autenticação (Fluxo Stack)
import { Welcome } from './src/screens/Welcome';
import { Login } from './src/screens/Login';
import { CadastroStep1 } from './src/screens/CadastroStep1';
import { CadastroStep2 } from './src/screens/CadastroStep2';

// Telas Principais (Fluxo Tabs)
import { Home } from './src/screens/Home'; // Agendamentos
import { PlanoAlimentar } from './src/screens/PlanoAlimentar';
import { FeedHome } from './src/screens/FeedHome';
import { IdeiasNutri } from './src/screens/IdeiasNutri';
import { Desempenho } from './src/screens/Desempenho';

// Telas Secundárias (Abrem por cima das abas)
import { Agendamento } from './src/screens/Agendamento';
import { Historico } from './src/screens/Historico';
import { Perfil } from './src/screens/Perfil';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- CONFIGURAÇÃO DA BARRA DE ABAS (NAVBAR) ---
function MainTabs({ route }: any) {
  const { id, nome } = route.params || { id: 0, nome: 'Visitante' };

  return (
    <Tab.Navigator
      initialRouteName="Agendamentos"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#A555B9',
        tabBarInactiveTintColor: '#C4C4C4',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 0,
          elevation: 5,
          
          // 👇 AQUI ESTÁ A CORREÇÃO DE ALTURA 👇
          height: Platform.OS === 'ios' ? 95 : 80, // Aumentei de 60 para 80 no Android
          paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Aumentei de 10 para 20
          paddingTop: 10, // Adicionei para o ícone não ficar colado no topo
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'FeedHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Agendamentos') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'IdeiasNutri') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'PlanoAlimentar') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Desempenho') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="FeedHome" 
        component={FeedHome} 
        initialParams={{ usuarioId: id, nome }} 
      />

      <Tab.Screen 
        name="Agendamentos" 
        component={Home} 
        initialParams={{ id, nome }} 
      />

      <Tab.Screen 
        name="IdeiasNutri" 
        component={IdeiasNutri} 
        initialParams={{ usuarioId: id }}
      />

      <Tab.Screen 
        name="PlanoAlimentar" 
        component={PlanoAlimentar} 
        initialParams={{ usuarioId: id }}
      />

      <Tab.Screen 
        name="Desempenho" 
        component={Desempenho} 
        initialParams={{ usuarioId: id }}
      />
    </Tab.Navigator>
  );
}

// --- NAVEGAÇÃO PRINCIPAL (STACK) ---
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      <Stack.Navigator 
        initialRouteName="Welcome" 
        screenOptions={{ 
          headerShown: false, 
          animation: 'slide_from_right' 
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CadastroStep1" component={CadastroStep1} />
        <Stack.Screen name="CadastroStep2" component={CadastroStep2} />
        
        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Perfil" component={Perfil} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}