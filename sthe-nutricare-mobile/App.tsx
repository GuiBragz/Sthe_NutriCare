import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- IMPORTAÇÃO DAS TELAS ---
import { Welcome } from './src/screens/Welcome';
import { Login } from './src/screens/Login';
import { CadastroStep1 } from './src/screens/CadastroStep1';
import { CadastroStep2 } from './src/screens/CadastroStep2';
import { Home } from './src/screens/Home'; 
import { PlanoAlimentar } from './src/screens/PlanoAlimentar';
import { FeedHome } from './src/screens/FeedHome';
import { IdeiasNutri } from './src/screens/IdeiasNutri';
import { Desempenho } from './src/screens/Desempenho';
import { NutriDashboard } from './src/screens/NutriDashboard';
import { NutriPacientes } from './src/screens/NutriPacientes';
import { NutriIdeias } from './src/screens/NutriIdeias'; 
import { NutriCriarPlano } from './src/screens/NutriCriarPlano';
import { Agendamento } from './src/screens/Agendamento';
import { Historico } from './src/screens/Historico';
import { Perfil } from './src/screens/Perfil';
import { NutriDesempenhoPaciente } from './src/screens/NutriDesempenhoPaciente';
import { RegistroDesempenho } from './src/screens/RegistroDesempenho';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- ESTILO FLUTUANTE PADRONIZADO (Verde e Dourado) ---
const floatingTabStyle = {
  position: 'absolute' as const,
  bottom: 25,
  left: 20,
  right: 20,
  elevation: 10,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
  backgroundColor: '#FFF',
  borderRadius: 25,
  height: 65,
  borderTopWidth: 0,
  borderWidth: 1.5,
  borderColor: '#FFD700',
  paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  paddingTop: 5,
};

// --- 1. BARRA DE ABAS DO PACIENTE ---
function MainTabs({ route }: any) {
  const { id, nome } = route.params || { id: 0, nome: 'Visitante' };

  return (
    <Tab.Navigator
      initialRouteName="Agendamentos"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#BDBDBD',
        tabBarStyle: floatingTabStyle,
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'FeedHome') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Agendamentos') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'IdeiasNutri') iconName = focused ? 'bulb' : 'bulb-outline';
          else if (route.name === 'PlanoAlimentar') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Desempenho') iconName = focused ? 'stats-chart' : 'stats-chart-outline';

          return <Ionicons name={iconName} size={26} color={color} />;
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

// --- 2. BARRA DE ABAS DA NUTRI ---
function NutriTabs({ route }: any) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2E7D32', 
        tabBarInactiveTintColor: '#BDBDBD',
        tabBarStyle: floatingTabStyle,
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Pacientes') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Receitas') iconName = focused ? 'restaurant' : 'restaurant-outline';
          
          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={NutriDashboard} />
      <Tab.Screen name="Pacientes" component={NutriPacientes} />
      <Tab.Screen name="Receitas" component={NutriIdeias} /> 
    </Tab.Navigator>
  );
}

// --- NAVEGAÇÃO PRINCIPAL ---
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
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#EFEDE7' }
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CadastroStep1" component={CadastroStep1} />
        <Stack.Screen name="CadastroStep2" component={CadastroStep2} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="NutriTabs" component={NutriTabs} />
        <Stack.Screen name="NutriCriarPlano" component={NutriCriarPlano} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="NutriDesempenhoPaciente" component={NutriDesempenhoPaciente} />
        <Stack.Screen name="RegistroDesempenho" component={RegistroDesempenho} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}