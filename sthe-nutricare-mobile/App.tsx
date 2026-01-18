import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// --- IMPORTAÇÃO DAS TELAS ---
// Agora importamos todas de seus arquivos separados
import { Welcome } from './src/screens/Welcome'; // A tela nova de Boas-vindas
import { Login } from './src/screens/Login';     // A tela nova de Login
import { Home } from './src/screens/Home';
import { Agendamento } from './src/screens/Agendamento';
import { Historico } from './src/screens/Historico';
import { CadastroStep1 } from './src/screens/CadastroStep1';
import { CadastroStep2 } from './src/screens/CadastroStep2';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* StatusBar Transparente:
         Isso faz o gradiente da tela Welcome ir até o topo da tela, 
         ficando atrás da hora/bateria do celular. Fica muito mais moderno!
      */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      <Stack.Navigator 
        initialRouteName="Welcome" // <--- O App começa na tela de Boas-vindas
        screenOptions={{ 
          headerShown: false, // Esconde a barra de título padrão em tudo
          animation: 'slide_from_right' // Animação suave entre telas
        }}
      >
        <Stack.Screen name="CadastroStep1" component={CadastroStep1} />
        <Stack.Screen name="CadastroStep2" component={CadastroStep2} />
        {/* 1. Tela Inicial (Botão Entrar grande) */}
        <Stack.Screen name="Welcome" component={Welcome} />
        
        {/* 2. Tela de Login (Formulário) */}
        <Stack.Screen name="Login" component={Login} />
        
        {/* 3. Área Logada */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="Historico" component={Historico} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}