import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from './theme/theme';
import HomeScreen from './screens/HomeScreen';

// Redux store will be implemented
// import { store } from './store';

const App: React.FC = () => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);

  return (
    <SafeAreaProvider>
      {/* <StoreProvider store={store}> */}
        <PaperProvider theme={theme}>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </PaperProvider>
      {/* </StoreProvider> */}
    </SafeAreaProvider>
  );
};

export default App;
