import React from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { MotiView } from "moti";

import { useAuth } from "../context/AuthContext";

import { Colors } from "../styles/Colors";

export default function AdmMenu() {
  const navigation = useNavigation();

  const { logout, nome, foto } =
    useAuth();

  const goToAdmin = (screen) => {
    navigation.navigate("Admin", {
      screen,
    });
  };

  return (
    <ImageBackground
      source={require("../assets/fundoTelaLogin.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
      />

      {/* OVERLAY */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.88)",
          "rgba(15,15,35,0.78)",
          "rgba(0,0,0,0.94)",
        ]}
        style={styles.overlay}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
          >
            Área do Organizador
          </Text>

        </View>

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >

          {/* PERFIL */}
          <MotiView
            from={{
              opacity: 0,
              translateY: -20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: "timing",
              duration: 700,
            }}
          >

            <BlurView
              intensity={60}
              tint="dark"
              style={styles.profileCard}
            >

              {/* FOTO */}
              <LinearGradient
                colors={[
                  Colors.primary,
                  "#7B5CFF",
                ]}
                style={
                  styles.avatarBorder
                }
              >

                <Image
                  source={{
                    uri:
                      foto ||
                      "https://i.pravatar.cc/150",
                  }}
                  style={
                    styles.avatar
                  }
                />

              </LinearGradient>

              {/* NOME */}
              <Text
                style={styles.name}
              >
                {nome ||
                  "Organizador"}
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Gerencie seus eventos,
                métricas e experiências
              </Text>

              {/* BADGES */}
              <View
                style={styles.badges}
              >

                <View
                  style={
                    styles.badge
                  }
                >
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={15}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    Verificado
                  </Text>
                </View>

                <View
                  style={
                    styles.badge
                  }
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={15}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    Organizador
                  </Text>
                </View>

              </View>

            </BlurView>

          </MotiView>

          {/* DASHBOARD */}
          <Text style={styles.section}>
            Painel Principal
          </Text>

          <View style={styles.grid}>

            <MenuCard
              icon="plus-circle"
              label="Criar Evento"
              subtitle="Novo evento"
              gradient={[
                "#7C3AED",
                "#5B21B6",
              ]}
              onPress={() =>
                goToAdmin(
                  "CriarEvento"
                )
              }
            />

            <MenuCard
              icon="calendar"
              label="Meus Eventos"
              subtitle="Gerencie"
              gradient={[
                "#2563EB",
                "#1D4ED8",
              ]}
              onPress={() =>
                goToAdmin(
                  "AdmEvento"
                )
              }
            />

            <MenuCard
              icon="chart-bar"
              label="Métricas"
              subtitle="Analytics"
              gradient={[
                "#059669",
                "#047857",
              ]}
              onPress={() =>
                goToAdmin(
                  "Metricas"
                )
              }
            />

            <MenuCard
              icon="help-circle"
              label="Ajuda"
              subtitle="Suporte"
              gradient={[
                "#EA580C",
                "#C2410C",
              ]}
              onPress={() =>
                goToAdmin("Ajuda")
              }
            />

          </View>

          {/* SAIR */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                "Sair",
                "Deseja sair da conta?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },

                  {
                    text: "Sair",
                    onPress: logout,
                  },
                ]
              )
            }
          >

            <LinearGradient
              colors={[
                "#DC2626",
                "#991B1B",
              ]}
              style={styles.logoutButton}
            >

              <MaterialCommunityIcons
                name="logout"
                size={22}
                color="#FFF"
              />

              <Text
                style={
                  styles.logoutText
                }
              >
                Sair da Conta
              </Text>

            </LinearGradient>

          </TouchableOpacity>

        </ScrollView>

      </LinearGradient>

    </ImageBackground>
  );
}

/* CARD */
function MenuCard({
  icon,
  label,
  subtitle,
  onPress,
  gradient,
}) {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "timing",
        duration: 500,
      }}
      style={styles.cardWrapper}
    >

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
      >

        <LinearGradient
          colors={gradient}
          style={styles.card}
        >

          <View
            style={styles.cardIcon}
          >
            <MaterialCommunityIcons
              name={icon}
              size={26}
              color="#FFF"
            />
          </View>

          <Text
            style={styles.cardTitle}
          >
            {label}
          </Text>

          <Text
            style={
              styles.cardSubtitle
            }
          >
            {subtitle}
          </Text>

        </LinearGradient>

      </TouchableOpacity>

    </MotiView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",

    paddingTop: 58,
    paddingHorizontal: 20,

    marginBottom: 10,
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  headerTitle: {
    color: "#FFF",

    fontSize: 21,
    fontWeight: "bold",

    marginLeft: 16,
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* PROFILE */
  profileCard: {
    overflow: "hidden",

    borderRadius: 30,

    alignItems: "center",

    paddingVertical: 28,
    paddingHorizontal: 20,

    marginBottom: 28,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",

    backgroundColor:
      "rgba(255,255,255,0.04)",
  },

  avatarBorder: {
    padding: 4,

    borderRadius: 60,

    marginBottom: 14,
  },

  avatar: {
    width: 95,
    height: 95,

    borderRadius: 50,

    backgroundColor: "#222",
  },

  name: {
    color: "#FFF",

    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.65)",

    marginTop: 8,

    textAlign: "center",

    lineHeight: 22,

    fontSize: 14,
  },

  /* BADGES */
  badges: {
    flexDirection: "row",

    gap: 10,

    marginTop: 18,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    backgroundColor:
      "rgba(255,255,255,0.08)",

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 30,
  },

  badgeText: {
    color: "#FFF",

    fontSize: 12,

    fontWeight: "600",
  },

  /* SECTION */
  section: {
    color: "#FFF",

    fontSize: 18,
    fontWeight: "bold",

    marginBottom: 16,
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent:
      "space-between",
  },

  /* CARD */
  cardWrapper: {
    width: "48%",

    marginBottom: 16,
  },

  card: {
    borderRadius: 26,

    padding: 18,

    minHeight: 150,

    justifyContent: "space-between",

    shadowColor: "#000",

    shadowOpacity: 0.3,
    shadowRadius: 14,

    elevation: 10,
  },

  cardIcon: {
    width: 52,
    height: 52,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  cardTitle: {
    color: "#FFF",

    fontSize: 17,
    fontWeight: "bold",

    marginTop: 18,
  },

  cardSubtitle: {
    color:
      "rgba(255,255,255,0.78)",

    marginTop: 5,

    fontSize: 13,
  },

  /* LOGOUT */
  logoutButton: {
    marginTop: 20,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 10,

    paddingVertical: 18,

    borderRadius: 22,
  },

  logoutText: {
    color: "#FFF",

    fontSize: 16,
    fontWeight: "bold",
  },
});