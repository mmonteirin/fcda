import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebaseConfig";

import {
  BarChart,
  PieChart,
} from "react-native-chart-kit";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { BlurView } from "expo-blur";

import { MotiView } from "moti";

import { Colors } from "../styles/Colors";

const screenWidth =
  Dimensions.get("window").width;

export default function AdmEventoMetrica({
  route,
  navigation,
}) {
  const eventoId =
    route?.params?.eventoId;

  const [avaliacoes, setAvaliacoes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

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
        collection(
          db,
          "eventos",
          eventoId,
          "avaliacoes"
        ),
        orderBy("createdAt", "desc")
      );

      const unsubscribe =
        onSnapshot(
          q,
          (snapshot) => {
            const lista =
              snapshot.docs.map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              );

            setAvaliacoes(lista);
            setLoading(false);
          },

          (err) => {
            console.error(err);

            setError(true);
            setLoading(false);
          }
        );

      return () => unsubscribe();
    } catch (err) {
      console.error(err);

      setError(true);
      setLoading(false);
    }
  }, [eventoId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Carregando métricas...
        </Text>
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

  if (
    !avaliacoes ||
    avaliacoes.length === 0
  ) {
    return (
      <Fallback
        icon="chart-bar-off"
        message="Sem métricas disponíveis"
        navigation={navigation}
      />
    );
  }

  const total = avaliacoes.length;

  const media =
    total > 0
      ? (
          avaliacoes.reduce(
            (a, b) =>
              a + (b?.nota || 0),
            0
          ) / total
        ).toFixed(1)
      : 0;

  const contar = (n) =>
    avaliacoes.filter(
      (a) => (a?.nota || 0) === n
    ).length;

  const chartDataBar = {
    labels: [
      "5★",
      "4★",
      "3★",
      "2★",
      "1★",
    ],

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
      population:
        contar(5) + contar(4),
      color: "#22C55E",
      legendFontColor:
        Colors.textPrimary,
      legendFontSize: 12,
    },

    {
      name: "Neutro",
      population: contar(3),
      color: "#F59E0B",
      legendFontColor:
        Colors.textPrimary,
      legendFontSize: 12,
    },

    {
      name: "Negativo",
      population:
        contar(2) + contar(1),
      color: "#EF4444",
      legendFontColor:
        Colors.textPrimary,
      legendFontSize: 12,
    },
  ];

  const hasBarData =
    chartDataBar.datasets[0].data.some(
      (v) => v > 0
    );

  const hasPieData = pieData.some(
    (p) => p.population > 0
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          "#0F172A",
          "#111827",
          "#1E1B4B",
        ]}
        style={styles.header}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Dashboard do Evento
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Métricas e desempenho
          </Text>
        </View>

      </LinearGradient>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* CARDS */}
        <View style={styles.grid}>

          <MetricCard
            title="Avaliações"
            value={total}
            icon="star-circle"
            color="#8B5CF6"
          />

          <MetricCard
            title="Média Geral"
            value={`${media} ★`}
            icon="chart-line"
            color="#06B6D4"
          />

          <MetricCard
            title="5 Estrelas"
            value={contar(5)}
            icon="emoticon-happy"
            color="#22C55E"
          />

          <MetricCard
            title="1 Estrela"
            value={contar(1)}
            icon="emoticon-sad"
            color="#EF4444"
          />

        </View>

        {/* BAR CHART */}
        {hasBarData && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Distribuição de Notas
            </Text>

            <MotiView
              from={{
                opacity: 0,
                translateY: 20,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: "timing",
                duration: 700,
              }}
            >

              <BlurView
                intensity={50}
                tint="dark"
                style={styles.chartCard}
              >

                <BarChart
                  data={chartDataBar}
                  width={
                    screenWidth - 60
                  }
                  height={240}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  chartConfig={
                    chartConfig
                  }
                  style={{
                    borderRadius: 20,
                  }}
                />

              </BlurView>

            </MotiView>
          </>
        )}

        {/* PIE CHART */}
        {hasPieData && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Sentimento Geral
            </Text>

            <MotiView
              from={{
                opacity: 0,
                translateY: 20,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: "timing",
                duration: 850,
              }}
            >

              <BlurView
                intensity={50}
                tint="dark"
                style={styles.chartCard}
              >

                <PieChart
                  data={pieData}
                  width={
                    screenWidth - 60
                  }
                  height={230}
                  accessor="population"
                  backgroundColor="transparent"
                  chartConfig={
                    chartConfig
                  }
                  paddingLeft="10"
                  absolute
                />

              </BlurView>

            </MotiView>
          </>
        )}

      </ScrollView>

    </View>
  );
}

/* CARD */
function MetricCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "timing",
        duration: 500,
      }}
      style={styles.metricCard}
    >

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.03)",
        ]}
        style={styles.metricGradient}
      >

        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                color,
            },
          ]}
        >

          <MaterialCommunityIcons
            name={icon}
            size={22}
            color="#FFF"
          />

        </View>

        <Text
          style={styles.metricTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.metricValue}
        >
          {value}
        </Text>

      </LinearGradient>

    </MotiView>
  );
}

/* FALLBACK */
function Fallback({
  icon,
  message,
  navigation,
}) {
  return (
    <View style={styles.container}>

      <LinearGradient
        colors={[
          "#0F172A",
          "#111827",
          "#1E1B4B",
        ]}
        style={styles.header}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>

      </LinearGradient>

      <View style={styles.fallback}>
        <MaterialCommunityIcons
          name={icon}
          size={70}
          color="rgba(255,255,255,0.25)"
        />

        <Text
          style={styles.fallbackText}
        >
          {message}
        </Text>
      </View>

    </View>
  );
}

/* CONFIG CHART */
const chartConfig = {
  backgroundGradientFrom:
    "transparent",

  backgroundGradientTo:
    "transparent",

  decimalPlaces: 0,

  color: (opacity = 1) =>
    `rgba(139,92,246, ${opacity})`,

  labelColor: () =>
    "rgba(255,255,255,0.7)",

  propsForBackgroundLines: {
    stroke:
      "rgba(255,255,255,0.08)",
  },

  propsForLabels: {
    fontSize: 12,
  },

  barPercentage: 0.7,
};

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B14",
  },

  loading: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#070B14",
  },

  loadingText: {
    color:
      "rgba(255,255,255,0.65)",

    marginTop: 15,
  },

  /* HEADER */
  header: {
    paddingTop: 60,
    paddingBottom: 22,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",

    gap: 16,

    borderBottomWidth: 1,

    borderBottomColor:
      "rgba(255,255,255,0.05)",
  },

  backButton: {
    width: 46,
    height: 46,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  headerTitle: {
    color: "#FFF",

    fontSize: 22,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color:
      "rgba(255,255,255,0.6)",

    marginTop: 2,
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",

    marginBottom: 20,
  },

  /* METRIC CARD */
  metricCard: {
    width: "48%",
    marginBottom: 16,
  },

  metricGradient: {
    borderRadius: 24,

    padding: 18,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.06)",
  },

  iconBox: {
    width: 46,
    height: 46,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 14,
  },

  metricTitle: {
    color:
      "rgba(255,255,255,0.65)",

    fontSize: 13,

    marginBottom: 6,
  },

  metricValue: {
    color: "#FFF",

    fontSize: 24,
    fontWeight: "bold",
  },

  /* SECTION */
  sectionTitle: {
    color: "#FFF",

    fontSize: 18,
    fontWeight: "bold",

    marginBottom: 14,
    marginTop: 10,
  },

  /* CHART CARD */
  chartCard: {
    overflow: "hidden",

    borderRadius: 26,

    paddingVertical: 18,

    marginBottom: 24,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.06)",
  },

  /* FALLBACK */
  fallback: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  fallbackText: {
    color:
      "rgba(255,255,255,0.6)",

    marginTop: 16,

    fontSize: 15,
  },
});