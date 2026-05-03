import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "../components/AppText";

export default function PerfilEdicao({ navigation }) {
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState("Marcos Monteiro");
  const [legenda, setLegenda] = useState("Amante de música");

  const handleSalvar = () => {
    Alert.alert("Sucesso", "Dados atualizados!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 HEADER */}
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
            Editar Perfil
          </AppText>
        </LinearGradient>

        {/* 👤 AVATAR */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />

          <TouchableOpacity style={styles.cameraButton}>
            <MaterialCommunityIcons
              name="camera"
              size={18}
              color="#0c1f11"
            />
          </TouchableOpacity>
        </View>

        {/* 📝 FORM */}
        <View style={styles.card}>

          <AppText style={styles.label}>Nome</AppText>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#6b7280"
          />

          <AppText style={styles.label}>Bio</AppText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={legenda}
            onChangeText={setLegenda}
            placeholder="Fale sobre você"
            placeholderTextColor="#6b7280"
            multiline
          />

          {/* 💾 SALVAR */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSalvar}
          >
            <AppText style={styles.primaryText}>
              Salvar Alterações
            </AppText>
          </TouchableOpacity>

          {/* ❌ CANCELAR */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppText style={styles.cancelText}>
              Cancelar
            </AppText>
          </TouchableOpacity>

        </View>

        {/* ❓ SUPORTE */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Suporte")}
            style={styles.supportRow}
          >
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={22}
              color="#3cc962"
            />
            <AppText style={styles.supportText}>
              Precisa de ajuda?
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />

      </ScrollView>
    </View>
  );
}

/* 🎨 PADRÃO GLOBAL (igual Feed) */
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

  /* 👤 AVATAR */
  avatarWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#3cc962",
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 130,
    backgroundColor: "#3cc962",
    padding: 8,
    borderRadius: 20,
  },

  /* 📦 CARD */
  card: {
    backgroundColor: "#13291d",
    margin: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f3d2a",
  },

  label: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#0c1f11",
    color: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f3d2a",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  primaryButton: {
    backgroundColor: "#3cc962",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  primaryText: {
    color: "#0c1f11",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelText: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 12,
  },

  supportRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  supportText: {
    color: "#3cc962",
    marginLeft: 10,
  },
});
