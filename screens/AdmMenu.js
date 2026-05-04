import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import GlobalStyles from "../styles/GlobalStyles";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

const styles = GlobalStyles;

export default function AdmMenu() {
  const navigation = useNavigation();
  const { logout, nome, foto } = useAuth();

  const goToAdmin = (screen) => {
    navigation.navigate("Admin", { screen });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: Colors.textPrimary,
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 15,
          }}
        >
          Área do Organizador
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PERFIL */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Image
            source={{ uri: foto || "https://i.pravatar.cc/150" }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: Colors.primary,
            }}
          />

          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 10,
            }}
          >
            {nome || "Organizador"}
          </Text>

          <Text style={{ color: Colors.textSecondary }}>
            Gerencie seus eventos
          </Text>
        </View>

        {/* MENU PRINCIPAL */}
        <View style={{ gap: 12 }}>
          <MenuCard
            icon="plus-circle"
            label="Criar evento"
            onPress={() => goToAdmin("CriarEvento")}
          />

          <MenuCard
            icon="calendar"
            label="Meus eventos"
            onPress={() => goToAdmin("AdmEvento")}
          />

          <MenuCard
            icon="chart-bar"
            label="Métricas"
            onPress={() => goToAdmin("Metricas")}
          />
        </View>

        {/* OUTROS */}
        <View style={{ marginTop: 30, gap: 12 }}>
          <MenuCard
            icon="help-circle"
            label="Central de ajuda"
            onPress={() => goToAdmin("Ajuda")}
          />

          <MenuCard
            icon="logout"
            label="Sair"
            danger
            onPress={() =>
              Alert.alert("Sair", "Deseja sair?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: logout },
              ])
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* COMPONENTE */
function MenuCard({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={danger ? Colors.error : Colors.primary}
      />

      <Text
        style={{
          color: danger ? Colors.error : Colors.textPrimary,
          fontSize: 15,
          marginLeft: 12,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
