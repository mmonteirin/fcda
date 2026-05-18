import { createStackNavigator } from "@react-navigation/stack";

import EventoHome from "../screens/EventoHome";
import EventoProximo from "../screens/EventoApp";
import EventoDetalhes from "../screens/EventoDetalhes";
import EventoAvaliacao from "../screens/EventoAvaliacao";
import EventosPublicos from "../screens/EventoPublico";
import TelaCulturaViva from "../screens/TelaCulturaViva";
import TelaExploreCidade from "../screens/TelaExploreCidade";
import EventoIngresso from "../screens/EventoIngresso";

const Stack = createStackNavigator();

export default function EventoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* 🔥 HUB */}
      <Stack.Screen name="EventoHome" component={EventoHome} />

      {/* 🔵 SEUS EVENTOS */}
      <Stack.Screen name="EventosApp" component={EventoProximo} />

      {/* 🟡 EVENTOS DO GOVERNO */}
      <Stack.Screen name="EventosPublicos" component={EventosPublicos} />

      {/* 🔁 COMPARTILHADO */}
      <Stack.Screen name="Detalhes" component={EventoDetalhes} />
      <Stack.Screen name="Avaliacao" component={EventoAvaliacao} />
      <Stack.Screen name="TelaCulturaViva" component={TelaCulturaViva} />
      <Stack.Screen name="TelaExploreCidade" component={TelaExploreCidade} />
      <Stack.Screen name="EventoIngresso" component={EventoIngresso} />

    </Stack.Navigator>
  );
}