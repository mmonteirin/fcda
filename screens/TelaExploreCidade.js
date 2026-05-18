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

import { Colors } from "../styles/Colors";

export default function TelaExploreCidade({ navigation }) {
  const categorias = [
    {
      nome: "Música",
      icon: "music",
      cor: "#8B5CF6",
    },

    {
      nome: "Gastronomia",
      icon: "silverware-fork-knife",
      cor: "#F59E0B",
    },

    {
      nome: "Teatro",
      icon: "drama-masks",
      cor: "#06B6D4",
    },

    {
      nome: "Exposições",
      icon: "palette",
      cor: "#EC4899",
    },
  ];

  const bairros = [
    "Praia de Iracema",
    "Benfica",
    "Aldeota",
    "Centro",
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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

          <Text style={styles.title}>
            Explore a Cidade
          </Text>

          <Text style={styles.subtitle}>
            Descubra bairros, cultura,
            gastronomia e experiências.
          </Text>
        </LinearGradient>

        {/* CATEGORIAS */}
        <Text style={styles.sectionTitle}>
          Categorias
        </Text>

        <View style={styles.grid}>
          {categorias.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryCard}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  item.cor,
                  "rgba(255,255,255,0.08)",
                ]}
                style={styles.categoryIcon}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color="#fff"
                />
              </LinearGradient>

              <Text style={styles.categoryText}>
                {item.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BAIRROS */}
        <Text style={styles.sectionTitle}>
          Explore Fortaleza
        </Text>

        {bairros.map((bairro, index) => (
          <TouchableOpacity
            key={index}
            style={styles.bairroCard}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.bairroNome}>
                {bairro}
              </Text>

              <Text style={styles.bairroDesc}>
                Eventos culturais ativos
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={Colors.textMuted}
            />
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
    paddingBottom: 36,
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
    marginBottom: 26,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 10,
    lineHeight: 22,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  categoryCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  categoryText: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  bairroCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bairroNome: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  bairroDesc: {
    color: Colors.textMuted,
    marginTop: 4,
  },
});
