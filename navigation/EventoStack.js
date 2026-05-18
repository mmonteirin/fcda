import { createStackNavigator } from "@react-navigation/stack";

import EventoHome from "../screens/EventoHome";
import EventoProximo from "../screens/EventoApp";
import EventoDetalhes from "../screens/EventoDetalhes";
import EventoAvaliacao from "../screens/EventoAvaliacao";
import EventosPublicos from "../screens/EventoPublico";
import TelaCulturaViva from "../screens/TelaCulturaViva";
import TelaExploreCidade from "../screens/TelaExploreCidade";
import EventoIngresso from "../screens/EventoIngresso";
import TelaIngressos from "../screens/TelaIngressos";
import PerfilDeclararOcorrencia from "../screens/PerfilDeclararOcorrencia";

const Stack = createStackNavigator();

export default function EventoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* HUB */}
      <Stack.Screen name="EventoHome" component={EventoHome} />

      {/* LISTAGENS */}
      <Stack.Screen name="EventosApp" component={EventoProximo} />
      <Stack.Screen name="EventosPublicos" component={EventosPublicos} />

      {/* DETALHES E AÇÕES */}
      <Stack.Screen name="Detalhes" component={EventoDetalhes} />
      <Stack.Screen name="Avaliacao" component={EventoAvaliacao} />
      <Stack.Screen name="TelaCulturaViva" component={TelaCulturaViva} />
      <Stack.Screen name="TelaExploreCidade" component={TelaExploreCidade} />

      {/* INGRESSOS — dois modos acessíveis */}
      <Stack.Screen name="EventoIngresso" component={EventoIngresso} />
      <Stack.Screen name="TelaIngressos" component={TelaIngressos} />

      {/* OCORRÊNCIAS */}
      <Stack.Screen name="NovaOcorrencia" component={PerfilDeclararOcorrencia} />
    </Stack.Navigator>
  );
}
