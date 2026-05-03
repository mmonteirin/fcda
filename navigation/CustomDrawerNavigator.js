import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Animated,
  TouchableOpacity,
} from "react-native";

import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

export default function CustomDrawerContent(props) {
  const { user, nome, foto, role, logout } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  const nomeUsuario =
    nome ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Usuário";

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
          } catch (error) {
            Alert.alert(
              "Erro",
              "Não foi possível sair da conta. Tente novamente."
            );
            setLoadingLogout(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[colors.background, colors.surfaceAlt]}
        style={{
          padding: 20,
          paddingTop: 50,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
        }}
      >
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Perfil")}
          style={{ alignItems: "center" }}
        >
          <Image
            source={{
              uri: foto || user?.photoURL || "https://i.pravatar.cc/150",
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 50,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          />

          <Text style={{ color: colors.text, fontSize: 16 }}>
            {nomeUsuario}
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {user?.email}
          </Text>

          {role === "admin" && (
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <Text style={{ color: colors.background, fontSize: 12 }}>
                Organizador
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* 📋 MENU */}
      <DrawerContentScrollView {...props}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <DrawerItemList {...props} />
        </Animated.View>
      </DrawerContentScrollView>

      {/* 🚪 LOGOUT */}
      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loadingLogout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceAlt,
            padding: 15,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.borderLight,
            opacity: loadingLogout ? 0.6 : 1,
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={colors.error}
          />

          <Text
            style={{
              color: colors.error,
              marginLeft: 10,
              fontWeight: "bold",
            }}
          >
            {loadingLogout ? "Saindo..." : "Sair da Conta"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 15,
            fontSize: 12,
          }}
        >
          v0.3.6
        </Text>
      </View>

    </View>
  );
}
