import { createStackNavigator } from "@react-navigation/stack";
import TelaFeed from "../screens/TelaFeed";
import EventoDetalhes from "../screens/EventoDetalhes";
import CriarPost from "../screens/CriarPost";

const Stack = createStackNavigator();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedHome" component={TelaFeed} />
      <Stack.Screen name="Detalhes" component={EventoDetalhes} />
      <Stack.Screen name="CriarPost" component={CriarPost} />
    </Stack.Navigator>
  );
}
