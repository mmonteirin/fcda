import TelaInicio from "../screens/TelaInicio";
import EventoDetalhes from "../screens/EventoDetalhes";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InicioHome" component={TelaInicio} />
      <Stack.Screen name="Detalhes" component={EventoDetalhes} />
    </Stack.Navigator>
  );
}