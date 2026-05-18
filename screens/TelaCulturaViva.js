import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { BlurView } from "expo-blur";

import { Colors } from "../styles/Colors";

export default function TelaCulturaViva({ navigation }) {
  const eventos = [
    {
      titulo: "Festival de Música Urbana",
      local: "Praia de Iracema",
      horario: "Ao vivo agora",
      icon: "music",
      cor: "#8B5CF6",
    },

    {
      titulo: "Feira Gastronômica",
      local: "Benfica",
      horario: "Começa às 19h",
      icon: "silverware-fork-knife",
      cor: "#F59E0B",
    },

    {
      titulo: "Teatro Cultural",
      local: "Centro",
      horario: "Últimas vagas",
      icon: "drama-masks",
      cor: "#06B6D4",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <LinearGradient
          colors={[
            Colors.primary,
            "#5B4CF0",
            "#241B4B",
          ]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <BlurView
              intensity={40}
              tint="dark"
              style={styles.iconCircle}
            >
              <MaterialCommunityIcons
                name="fire"
                size={34}
                color="#fff"
              />
            </BlurView>

            <Text style={styles.title}>
              Cultura Viva
            </Text>

            <Text style={styles.subtitle}>
              Descubra o que está acontecendo
              agora em Fortaleza.
            </Text>
          </View>
        </LinearGradient>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>
              Cidade agora
            </Text>

            <Text style={styles.statusTitle}>
              🔥 Alta atividade cultural
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>
              AO VIVO
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="calendar-star"
              size={24}
              color="#8B5CF6"
            />

            <Text style={styles.statNumber}>
              124
            </Text>

            <Text style={styles.statLabel}>
              Eventos
            </Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={24}
              color="#06B6D4"
            />

            <Text style={styles.statNumber}>
              18
            </Text>

            <Text style={styles.statLabel}>
              Próximos
            </Text>
          </View>
        </View>

        {/* EVENTOS */}
        <Text style={styles.sectionTitle}>
          🔥 Em alta hoje
        </Text>

        {eventos.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            style={styles.eventCard}
          >
            <LinearGradient
              colors={[
                item.cor,
                "rgba(255,255,255,0.05)",
              ]}
              style={styles.eventIcon}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color="#fff"
              />
            </LinearGradient>

            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {item.titulo}
              </Text>

              <Text style={styles.eventLocal}>
                {item.local}
              </Text>
            </View>

            <Text style={styles.eventTime}>
              {item.horario}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 34,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  headerContent: {
    alignItems: "center",
  },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 18,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },

  statusCard: {
    margin: 18,
    padding: 18,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLabel: {
    color: Colors.textMuted,
    marginBottom: 6,
  },

  statusTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  liveBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },

  liveText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  statCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingVertical: 24,
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
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 26,
    marginBottom: 14,
    paddingHorizontal: 18,
  },

  eventCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  eventIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  eventTitle: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  eventLocal: {
    color: Colors.textMuted,
    marginTop: 4,
  },

  eventTime: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
});
