import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import GlobalStyles from "../styles/GlobalStyles";
import { Colors } from "../styles/Colors";

import { BarChart, PieChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const styles = GlobalStyles;
const screenWidth = Dimensions.get("window").width;

export default function AdmEventoMetrica({ route, navigation }) {
  const eventoId = route?.params?.eventoId;

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!eventoId) {
    return (
      <Fallback
        icon="alert-circle-outline"
        message="Evento não encontrado"
        navigation={navigation}
      />
    );
  }

  useEffect(() => {
    try {
      const q = query(
        collection(db, "eventos", eventoId, "avaliacoes"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setAvaliacoes(lista);
          setLoading(false);
        },
        (err) => {
          console.error("Erro Firestore:", err);
          setError(true);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Erro geral:", err);
      setError(true);
      setLoading(false);
    }
  }, [eventoId]);

  if (loading) {
    return (
      <View style={styles.loadingSpinner}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <Fallback
        icon="alert-outline"
        message="Erro ao carregar dados"
        navigation={navigation}
      />
    );
  }

  if (!avaliacoes || avaliacoes.length === 0) {
    return (
      <Fallback
        icon="chart-bar-off"
        message="Sem dados para mostrar"
        navigation={navigation}
      />
    );
  }

  const total = avaliacoes.length;

  const media =
    total > 0
      ? (
          avaliacoes.reduce((a, b) => a + (b?.nota || 0), 0) / total
        ).toFixed(1)
      : 0;

  const contar = (n) =>
    avaliacoes.filter((a) => (a?.nota || 0) === n).length;

  const chartDataBar = {
    labels: ["5★", "4★", "3★", "2★", "1★"],
    datasets: [
      {
        data: [
          contar(5),
          contar(4),
          contar(3),
          contar(2),
          contar(1),
        ],
      },
    ],
  };

  const pieData = [
    {
      name: "Positivo",
      population: contar(5) + contar(4),
      color: Colors.primary,
      legendFontColor: Colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: "Neutro",
      population: contar(3),
      color: Colors.warning,
      legendFontColor: Colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: "Negativo",
      population: contar(2) + contar(1),
      color: Colors.error,
      legendFontColor: Colors.textPrimary,
      legendFontSize: 12,
    },
  ];

  const hasBarData = chartDataBar.datasets[0].data.some((v) => v > 0);
  const hasPieData = pieData.some((p) => p.population > 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.grid}>
          <Card title="Total Avaliações" value={total} />
          <Card title="Média Geral" value={`${media} ★`} />
          <Card title="Notas 5★" value={contar(5)} />
          <Card title="Notas 1★" value={contar(1)} />
        </View>

        {hasBarData && (
          <>
            <Text style={styles.sectionTitle}>Distribuição de Notas</Text>
            <View style={styles.eventCard}>
              <BarChart
                data={chartDataBar}
                width={screenWidth - 40}
                height={220}
                fromZero
                chartConfig={chartConfig}
              />
            </View>
          </>
        )}

        {hasPieData && (
          <>
            <Text style={styles.sectionTitle}>Sentimento Geral</Text>
            <View style={styles.eventCard}>
              <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={220}
                accessor="population"
                backgroundColor="transparent"
                chartConfig={chartConfig}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* COMPONENTES */

function Header({ navigation }) {
  return (
    <View style={{ flexDirection: "row", padding: 20, marginTop: 30 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={26}
          color={Colors.primary}
        />
      </TouchableOpacity>

      <Text style={{ color: Colors.textPrimary, fontSize: 18, marginLeft: 15 }}>
        Dashboard do Evento
      </Text>
    </View>
  );
}

function Card({ title, value }) {
  return (
    <View style={styles.cardCategory}>
      <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
        {title}
      </Text>
      <Text
        style={{
          color: Colors.primary,
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Fallback({ icon, message, navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header navigation={navigation} />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialCommunityIcons
          name={icon}
          size={60}
          color={Colors.textMuted}
        />
        <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

/* CONFIG */
const chartConfig = {
  backgroundColor: Colors.surface,
  backgroundGradientFrom: Colors.surface,
  backgroundGradientTo: Colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) =>
    `rgba(108,92,231, ${opacity})`, // baseado no primary
  labelColor: () => Colors.textPrimary,
};
