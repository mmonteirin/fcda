import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../styles/Colors";

export default function EventoDetalhes({ route, navigation }) {
  const { evento } = route.params;
  const insets = useSafeAreaInsets();

  if (!evento) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textPrimary }}>
          Evento não encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* HEADER */}
        <View>
          <Image
            source={{ uri: evento.imagem }}
            style={styles.image}
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.overlay}
          />

          {/* BOTÃO VOLTAR */}
          <TouchableOpacity
            style={[styles.back, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>{evento.titulo}</Text>
            <Text style={styles.local}>📍 {evento.local}</Text>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          <Text style={styles.section}>Descrição</Text>
          <Text style={styles.description}>
            {evento.descricao || "Sem descrição"}
          </Text>

          <Text style={styles.section}>Data</Text>
          <Text style={styles.info}>{evento.data}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  image: {
    width: "100%",
    height: 280,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 140,
  },

  back: {
    position: "absolute",
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 10,
  },

  headerText: {
    position: "absolute",
    bottom: 20,
    left: 16,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  local: {
    color: "#ccc",
    fontSize: 13,
  },

  content: {
    padding: 16,
  },

  section: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },

  description: {
    color: Colors.textSecondary,
    marginTop: 5,
  },

  info: {
    color: Colors.primary,
    marginTop: 5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
