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

// Telas Principais DO PACIENTE (Fluxo Tabs)
import { Home } from './src/screens/Home'; // Agendamentos
import { PlanoAlimentar } from './src/screens/PlanoAlimentar';
import { FeedHome } from './src/screens/FeedHome';
import { IdeiasNutri } from './src/screens/IdeiasNutri';
import { Desempenho } from './src/screens/Desempenho';

// Telas Principais DA NUTRICIONISTA (Novas)
import { NutriDashboard } from './src/screens/NutriDashboard';
import { NutriPacientes } from './src/screens/NutriPacientes';

// Telas Secundárias (Abrem por cima das abas)
import { Agendamento } from './src/screens/Agendamento';
import { Historico } from './src/screens/Historico';
import { Perfil } from './src/screens/Perfil';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 1. BARRA DE ABAS DO PACIENTE (Roxo/Lilás) ---
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
          height: Platform.OS === 'ios' ? 95 : 80,
          paddingBottom: Platform.OS === 'ios' ? 30 : 20,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          if (route.name === 'FeedHome') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Agendamentos') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'IdeiasNutri') iconName = focused ? 'bulb' : 'bulb-outline';
          else if (route.name === 'PlanoAlimentar') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Desempenho') iconName = focused ? 'stats-chart' : 'stats-chart-outline';

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedHome" component={FeedHome} initialParams={{ usuarioId: id, nome }} />
      <Tab.Screen name="Agendamentos" component={Home} initialParams={{ id, nome }} />
      <Tab.Screen name="IdeiasNutri" component={IdeiasNutri} initialParams={{ usuarioId: id }} />
      <Tab.Screen name="PlanoAlimentar" component={PlanoAlimentar} initialParams={{ usuarioId: id }} />
      <Tab.Screen name="Desempenho" component={Desempenho} initialParams={{ usuarioId: id }} />
    </Tab.Navigator>
  );
}

// --- 2. BARRA DE ABAS DA NUTRI (Verde) ---
function NutriTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2F9F85', // Verde para diferenciar
        tabBarInactiveTintColor: '#C4C4C4',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 0,
          elevation: 5,
          height: Platform.OS === 'ios' ? 95 : 80,
          paddingBottom: Platform.OS === 'ios' ? 30 : 20,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          if (route.name === 'Dashboard') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Pacientes') iconName = focused ? 'people' : 'people-outline';
          
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={NutriDashboard} />
      <Tab.Screen name="Pacientes" component={NutriPacientes} />
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
        
        {/* Aba do Paciente */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Aba da Nutricionista (NOVO) */}
        <Stack.Screen name="NutriTabs" component={NutriTabs} />

        {/* Telas Comuns */}
        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Perfil" component={Perfil} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}