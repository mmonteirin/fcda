import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../styles/Colors"; // ✅ CORRETO

export default function EventoHome({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient
        colors={[Colors.primary, "#4b3fd1"]} // 🎨 degrade corrigido
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Eventos 🎟️</Text>

        <Text style={styles.subtitle}>
          Escolha como deseja explorar
        </Text>
      </LinearGradient>

      {/* CONTEÚDO */}
      <View style={styles.content}>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("EventosApp")}
        >
          <MaterialCommunityIcons
            name="cellphone"
            size={28}
            color={Colors.primary}
          />

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Eventos do App</Text>
            <Text style={styles.cardDesc}>
              Eventos criados dentro da plataforma
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("EventosPublicos")}
        >
          <MaterialCommunityIcons
            name="earth"
            size={28}
            color={Colors.primary}
          />

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>
              Eventos Culturais
            </Text>
            <Text style={styles.cardDesc}>
              Eventos oficiais e governamentais
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  backButton: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 26,
    color: Colors.textPrimary,
    fontFamily: "PoppinsBold",
  },

  subtitle: {
    color: Colors.textMuted,
    marginTop: 5,
    fontFamily: "PoppinsRegular",
  },

  content: {
    padding: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  textContainer: {
    marginLeft: 15,
  },

  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
  },

  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
    fontFamily: "PoppinsRegular",
  },
});
