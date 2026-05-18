import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";

import * as Location from "expo-location";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "../styles/Colors";
import { getMapaSummary } from "../services/mapaVivoService";

export default function TelaPainelCidade({
  navigation,
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [cidade, setCidade] = useState("---");
  const [bairro, setBairro] = useState("---");
  const [regiao, setRegiao] = useState("---");

  const [endereco, setEndereco] =
    useState("Endereço desconhecido");

  const [stats, setStats] = useState({
    eventos: 12,
    ocorrencias: 4,
    verificadas: 9,
    alertas: 2,
    proximos: 0,
    checkIns: 0,
    hotspots: 0,
  });

  async function carregarLocalizacao() {
    try {
      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const resumo = await getMapaSummary(
        location.coords.latitude,
        location.coords.longitude
      );

      setStats((current) => ({
        ...current,
        eventos: resumo.totalEventos,
        verificadas: resumo.totalEventos,
        proximos: resumo.proximos,
        checkIns: resumo.totalCheckins,
        hotspots: resumo.hotspots,
      }));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
      );

      const data = await response.json();

      setCidade(
        data?.address?.city ||
          data?.address?.town ||
          data?.address?.municipality ||
          "Cidade desconhecida"
      );

      setBairro(
        data?.address?.suburb ||
          data?.address?.neighbourhood ||
          "Bairro desconhecido"
      );

      setRegiao(
        data?.address?.state ||
          "Estado desconhecido"
      );

      setEndereco(
        `${
          data?.address?.road ||
          "Rua desconhecida"
        }${
          data?.address?.house_number
            ? `, ${data.address.house_number}`
            : ""
        }`
      );
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarLocalizacao();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarLocalizacao();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Carregando painel...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* HEADER */}
        <LinearGradient
          colors={[
            Colors.primary,
            "#5B4CF0",
            "#241B4B",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* GLOW */}
          <View style={styles.glow} />

          {/* BACK */}
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          {/* CONTENT */}
          <View style={styles.headerContent}>
            {/* ÍCONE */}
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="city-variant-outline"
                size={34}
                color="#fff"
              />
            </View>

            {/* INFOS */}
            <View style={styles.headerTexts}>
              <Text style={styles.headerTitle}>
                Painel da Cidade
              </Text>

              <Text style={styles.cityName}>
                {cidade}
              </Text>

              <Text style={styles.regionText}>
                {bairro} • {regiao}
              </Text>
            </View>

            {/* LOCAL */}
            <View style={styles.locationMiniCard}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={18}
                color="#fff"
              />

              <Text
                style={styles.locationMiniTitle}
              >
                Sua localização
              </Text>

              <Text
                numberOfLines={2}
                style={styles.locationMiniText}
              >
                {endereco}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* STATS */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="calendar-star"
              size={26}
              color="#8b5cf6"
            />

            <Text style={styles.statNumber}>
              {stats.eventos}
            </Text>

            <Text style={styles.statLabel}>
              Eventos
            </Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="fire"
              size={26}
              color="#ef4444"
            />

            <Text style={styles.statNumber}>
              {stats.hotspots}
            </Text>

            <Text style={styles.statLabel}>
              Hotspots
            </Text>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: "#22c55e",
                },
              ]}
            />

            <View>
              <Text style={styles.statusTitle}>
                Eventos próximos
              </Text>

              <Text style={styles.statusValue}>
                {stats.proximos} em até 5km
              </Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: "#f59e0b",
                },
              ]}
            />

            <View>
              <Text style={styles.statusTitle}>
                Check-ins culturais
              </Text>

              <Text style={styles.statusValue}>
                {stats.checkIns} registros recentes
              </Text>
            </View>
          </View>
        </View>

        {/* AÇÕES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Ações rápidas
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("MapaVivo")
            }
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={22}
                color={Colors.primary}
              />

              <Text style={styles.actionText}>
                Abrir Mapa Vivo da Cultura
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("HomeTabs", {
                screen: "Ingressos",
                params: {
                  screen: "EventosApp",
                },
              })
            }
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons
                name="bookmark-check-outline"
                size={22}
                color={Colors.primary}
              />

              <Text style={styles.actionText}>
                Ver próximos eventos
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("HomeTabs", {
                screen: "Feed",
              })
            }
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons
                name="rss"
                size={22}
                color={Colors.primary}
              />

              <Text style={styles.actionText}>
                Ver Feed de Eventos
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* ATIVIDADE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Atividade recente
          </Text>

          <View style={styles.activityItem}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={20}
              color="#22c55e"
            />

            <View style={{ flex: 1 }}>
              <Text
                style={styles.activityTitle}
              >
                Você confirmou presença
              </Text>

              <Text
                style={styles.activityText}
              >
                Festival Cultural do Ceará
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={20}
              color="#f59e0b"
            />

            <View style={{ flex: 1 }}>
              <Text
                style={styles.activityTitle}
              >
                Nova ocorrência registrada
              </Text>

              <Text
                style={styles.activityText}
              >
                Praça do Mondubim
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  loadingText: {
    marginTop: 12,
    color: Colors.textMuted,
  },

  header: {
    paddingTop: 54,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 140,
    backgroundColor:
      "rgba(255,255,255,0.08)",
    top: -80,
    right: -80,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  headerTexts: {
    flex: 1,
  },

  headerTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 2,
  },

  cityName: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },

  regionText: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontSize: 13,
  },

  locationMiniCard: {
    width: 140,
    backgroundColor:
      "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 12,
    marginLeft: 12,
  },

  locationMiniTitle: {
    color: "#fff",
    fontSize: 11,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "700",
  },

  locationMiniText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    lineHeight: 16,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },

  statCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statNumber: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },

  statLabel: {
    color: Colors.textMuted,
    marginTop: 4,
    fontSize: 13,
  },

  statusContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
  },

  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 10,
    marginRight: 14,
  },

  statusTitle: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  statusValue: {
    color: Colors.textMuted,
    marginTop: 3,
    fontSize: 12,
  },

  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    color: Colors.textPrimary,
    marginLeft: 12,
    fontWeight: "600",
    fontSize: 14,
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  activityTitle: {
    color: Colors.textPrimary,
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 13,
  },

  activityText: {
    color: Colors.textMuted,
    marginLeft: 12,
    marginTop: 4,
    fontSize: 12,
  },
});
