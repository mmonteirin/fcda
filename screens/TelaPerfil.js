import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function TelaPerfil({ navigation }) {
  const { foto, nome, user, logout } = useAuth();
  const [loadingLogout, setLoadingLogout] = useState(false);
  const insets = useSafeAreaInsets();

  const go = (screen) => {
    navigation.navigate("Perfil", { screen });
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setLoadingLogout(true);
          try {
            await logout();
          } catch {
            Alert.alert("Erro", "Não foi possível sair.");
            setLoadingLogout(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* 🔥 HEADER */}
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.profileRow}>
            <Image
              source={{
                uri:
                  foto ||
                  user?.photoURL ||
                  "https://i.pravatar.cc/150",
              }}
              style={styles.avatar}
            />

            <View style={{ marginLeft: 12 }}>
              <AppText style={styles.nome}>
                {nome || user?.displayName || "Usuário"}
              </AppText>

              <AppText style={styles.email}>
                {user?.email ?? "Email não disponível"}
              </AppText>
            </View>
          </View>
        </LinearGradient>

        {/* 🔥 MENU */}
        <View style={styles.menu}>

          <AppText style={styles.section}>Conta</AppText>

          <TouchableOpacity
            style={styles.card}
            onPress={() => go("PerfilEditar")}
          >
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={Colors.primary} />
            <AppText style={styles.texto}>Editar Perfil</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => go("ResetPassword")}
          >
            <MaterialCommunityIcons name="lock-reset" size={22} color={Colors.primary} />
            <AppText style={styles.texto}>Alterar Senha</AppText>
          </TouchableOpacity>

          <AppText style={styles.section}>Atividade</AppText>

          <TouchableOpacity
            style={styles.card}
            onPress={() => go("Ocorrencias")}
          >
            <MaterialCommunityIcons name="history" size={22} color={Colors.primary} />
            <AppText style={styles.texto}>
              Histórico de Ocorrências
            </AppText>
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loadingLogout}
            style={styles.logout}
          >
            {loadingLogout ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <MaterialCommunityIcons name="logout" size={22} color={Colors.error} />
            )}

            <AppText style={styles.logoutText}>
              {loadingLogout ? "Saindo..." : "Sair da Conta"}
            </AppText>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

/* 🎨 PADRÃO GLOBAL */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  nome: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },

  email: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  menu: {
    padding: 16,
  },

  section: {
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  texto: {
    color: Colors.textPrimary,
    marginLeft: 12,
  },

  logout: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },

  logoutText: {
    color: Colors.error,
    marginLeft: 12,
  },
});
