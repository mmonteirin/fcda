import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Animated,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();

  const { user, nome, foto, role, logout } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const nomeUsuario =
    nome ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const handleLogout = () => {
    const executeLogout = async () => {
      try {
        setLoadingLogout(true);
        await logout();
      } catch (e) {
        console.log(e);
        Alert.alert("Erro", "Não foi possível sair.");
        setLoadingLogout(false);
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm("Deseja sair da conta?");
      if (confirm) executeLogout();
    } else {
      Alert.alert("Sair", "Deseja sair da conta?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: executeLogout,
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.primary, "#5B4CF0", "#241B4B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop: insets.top + 20,
          },
        ]}
      >
        {/* Glow */}
        <View style={styles.glow} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => props.navigation.navigate("Perfil")}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
            }}
          >
            {/* FOTO */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    foto ||
                    user?.photoURL ||
                    "https://i.pravatar.cc/300",
                }}
                style={styles.avatar}
              />

              <View style={styles.onlineBadge} />
            </View>

            {/* NOME */}
            <Text style={styles.nome}>
              {nomeUsuario}
            </Text>

            {/* EMAIL */}
            <Text style={styles.email}>
              {user?.email || "Sem email"}
            </Text>

            {/* BADGE */}
            <BlurView intensity={40} tint="dark" style={styles.roleBadge}>
              <MaterialCommunityIcons
                name={
                  role === "admin"
                    ? "shield-crown"
                    : "account-circle"
                }
                size={14}
                color="#fff"
              />

              <Text style={styles.roleText}>
                {role === "admin"
                  ? "Organizador"
                  : "Participante"}
              </Text>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>

      {/* MENU */}
      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 8,
          }}
        >
          <DrawerItemList {...props} />
        </Animated.View>
      </DrawerContentScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* BOTÃO SUPORTE */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => props.navigation.navigate("TelaSuporte")}
        >
          <MaterialCommunityIcons
            name="lifebuoy"
            size={20}
            color={Colors.primary}
          />

          <Text style={styles.supportText}>
            Central de Ajuda
          </Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loadingLogout}
          activeOpacity={0.8}
          style={[
            styles.logoutButton,
            loadingLogout && {
              opacity: 0.7,
            },
          ]}
        >
          {loadingLogout ? (
            <ActivityIndicator color={Colors.error} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={Colors.error}
              />

              <Text style={styles.logoutText}>
                Sair da Conta
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* VERSION */}
        <Text style={styles.version}>
          MonitoraCult • v0.6
        </Text>
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
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -70,
    right: -60,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },

  onlineBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },

  nome: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  email: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 14,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },

  supportText: {
    color: Colors.textPrimary,
    marginLeft: 10,
    fontWeight: "600",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
    paddingVertical: 16,
    borderRadius: 16,
  },

  logoutText: {
    color: Colors.error,
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 15,
  },

  version: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 16,
    fontSize: 12,
  },
});