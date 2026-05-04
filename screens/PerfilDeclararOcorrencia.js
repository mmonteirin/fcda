import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "../components/AppText";

export default function PerfilDeclararOcorrencia({ navigation, route }) {
  const { eventoId, nomeEvento } = route.params;
  const insets = useSafeAreaInsets();

  const [text_ocorrencia, setText_ocorrencia] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarOcorrencia = async () => {
    if (!text_ocorrencia.trim()) {
      Alert.alert("Erro", "Descreva a ocorrência.");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      await addDoc(
        collection(db, "eventos", eventoId, "ocorrencias"),
        {
          userId: user.uid,
          nome: user.displayName || "Anônimo",
          local: nomeEvento || "Local não definido",
          descricao: text_ocorrencia,
          createdAt: serverTimestamp(),
        }
      );

      Alert.alert("Sucesso", "Ocorrência enviada!");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 🔥 HEADER PADRÃO FEED */}
      <LinearGradient
        colors={["#0c1f11", "#133d24"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#3cc962"
          />
        </TouchableOpacity>

        <AppText style={styles.headerTitle}>
          Ocorrência
        </AppText>
      </LinearGradient>

      {/* 📦 CONTEÚDO */}
      <View style={styles.content}>

        {/* 📍 CARD LOCAL */}
        <View style={styles.card}>
          <AppText style={styles.label}>Local</AppText>
          <AppText style={styles.local}>
            {nomeEvento || "Local não definido"}
          </AppText>
        </View>

        {/* 📝 CARD INPUT */}
        <View style={styles.card}>
          <AppText style={styles.label}>
            Descreva o ocorrido
          </AppText>

          <TextInput
            value={text_ocorrencia}
            onChangeText={setText_ocorrencia}
            placeholder="Digite aqui..."
            placeholderTextColor="#777"
            multiline
            style={styles.input}
          />
        </View>

        {/* 🚀 BOTÃO */}
        <TouchableOpacity
          onPress={enviarOcorrencia}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#0c1f11" />
          ) : (
            <AppText style={styles.buttonText}>
              Enviar Ocorrência
            </AppText>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}

/* 🎨 STYLES PADRÃO FEED */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1f11",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
  },

  card: {
    backgroundColor: "#13291d",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1f3d2a",
  },

  label: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 6,
  },

  local: {
    color: "#3cc962",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#0c1f11",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    height: 140,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1f3d2a",
  },

  button: {
    marginTop: 10,
    backgroundColor: "#3cc962",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#0c1f11",
    fontWeight: "bold",
    fontSize: 16,
  },
});
