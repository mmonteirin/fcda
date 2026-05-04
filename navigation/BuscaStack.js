import { createStackNavigator } from "@react-navigation/stack";
import TelaBusca from "../screens/TelaBusca";
import EventoDetalhes from "../screens/EventoDetalhes";

const Stack = createStackNavigator();

export default function BuscaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuscaHome" component={TelaBusca} />
      <Stack.Screen name="Detalhes" component={EventoDetalhes} />
    </Stack.Navigator>
  );
}
