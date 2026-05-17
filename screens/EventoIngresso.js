import React, { useState } from "react";

import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  BlurView,
} from "expo-blur";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  MotiView,
} from "moti";

import { useAuth } from "../context/AuthContext";

import {
  comprarIngresso,
} from "../services/ingressoService";

import Colors from "../styles/Colors";

export default function EventoIngresso({
  route,
  navigation,
}) {
  const { evento } = route.params;

  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const handleCompra =
    async () => {
      setLoading(true);

      const sucesso =
        await comprarIngresso({
          eventoId: evento.id,
          user,
          valor:
            evento.valor || 0,
        });

      setLoading(false);

      if (sucesso) {
        Alert.alert(
          "Sucesso 🎉",
          "Ingresso comprado!"
        );

        navigation.goBack();
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível concluir"
        );
      }
    };

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
      />

      {/* HERO IMAGE */}
      <ImageBackground
        source={{
          uri:
            evento.imagem ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200",
        }}
        style={styles.hero}
      >

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.95)",
          ]}
          style={styles.overlay}
        >

          {/* HEADER */}
          <View style={styles.header}>

            <TouchableOpacity
              onPress={() => {
                if (
                  navigation.canGoBack()
                ) {
                  navigation.goBack();
                } else {
                  navigation.navigate(
                    "Inicio"
                  );
                }
              }}
              style={
                styles.backBtn
              }
            >

              <BlurView
                intensity={60}
                tint="dark"
                style={
                  styles.blurBtn
                }
              >

                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#FFF"
                />

              </BlurView>

            </TouchableOpacity>

          </View>

          {/* TITULO */}
          <MotiView
            from={{
              opacity: 0,
              translateY: 30,
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

            <View
              style={
                styles.heroContent
              }
            >

              <View
                style={
                  styles.badge
                }
              >

                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={16}
                  color="#FFF"
                />

                <Text
                  style={
                    styles.badgeText
                  }
                >
                  Ingresso
                </Text>

              </View>

              <Text
                style={
                  styles.titulo
                }
              >
                {evento.titulo}
              </Text>

              <Text
                style={
                  styles.local
                }
              >
                📍{" "}
                {evento.nomeLocal ||
                  "Local não informado"}
              </Text>

            </View>

          </MotiView>

        </LinearGradient>

      </ImageBackground>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* CARD */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 250,
            duration: 700,
          }}
        >

          <BlurView
            intensity={40}
            tint="dark"
            style={styles.card}
          >

            {/* PREÇO */}
            <View
              style={
                styles.priceRow
              }
            >

              <View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Tipo do ingresso
                </Text>

                <Text
                  style={
                    styles.tipo
                  }
                >
                  {evento.tipoEvento ===
                  "gratuito"
                    ? "Evento Gratuito"
                    : "Ingresso Pago"}
                </Text>

              </View>

              <LinearGradient
                colors={[
                  "#7C3AED",
                  "#5B21B6",
                ]}
                style={
                  styles.priceBox
                }
              >

                <Text
                  style={
                    styles.price
                  }
                >
                  {evento.tipoEvento ===
                  "gratuito"
                    ? "FREE"
                    : `R$ ${evento.valor}`}
                </Text>

              </LinearGradient>

            </View>

            {/* INFOS */}
            <View
              style={
                styles.infoContainer
              }
            >

              <View
                style={
                  styles.infoRow
                }
              >

                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color={
                    Colors.primary
                  }
                />

                <Text
                  style={
                    styles.infoText
                  }
                >
                  {evento.dataEvento ||
                    "Data não informada"}
                </Text>

              </View>

              <View
                style={
                  styles.infoRow
                }
              >

                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={
                    Colors.primary
                  }
                />

                <Text
                  style={
                    styles.infoText
                  }
                >
                  {evento.nomeLocal ||
                    "Local não informado"}
                </Text>

              </View>

            </View>

          </BlurView>

        </MotiView>

        {/* BOTÃO */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 400,
            duration: 700,
          }}
        >

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={loading}
            onPress={handleCompra}
          >

            <LinearGradient
              colors={[
                "#7C3AED",
                "#5B21B6",
              ]}
              style={
                styles.button
              }
            >

              {loading ? (
                <ActivityIndicator
                  color="#FFF"
                />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={22}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    {evento.tipoEvento ===
                    "gratuito"
                      ? "Reservar ingresso"
                      : "Comprar ingresso"}
                  </Text>
                </>
              )}

            </LinearGradient>

          </TouchableOpacity>

        </MotiView>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#070B14",
  },

  /* HERO */
  hero: {
    height: 360,
  },

  overlay: {
    flex: 1,

    justifyContent:
      "space-between",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  backBtn: {
    alignSelf: "flex-start",
  },

  blurBtn: {
    width: 48,
    height: 48,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  heroContent: {
    padding: 24,
  },

  badge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.12)",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 20,

    marginBottom: 15,
  },

  badgeText: {
    color: "#FFF",

    marginLeft: 6,

    fontWeight: "600",

    fontSize: 12,
  },

  titulo: {
    color: "#FFF",

    fontSize: 30,

    fontFamily:
      "PoppinsBold",

    lineHeight: 40,
  },

  local: {
    color:
      "rgba(255,255,255,0.75)",

    marginTop: 10,

    fontSize: 14,

    lineHeight: 22,
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingBottom: 40,
    marginTop: -40,
  },

  card: {
    borderRadius: 28,

    padding: 22,

    overflow: "hidden",

    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  priceRow: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  label: {
    color:
      "rgba(255,255,255,0.55)",

    fontSize: 13,
  },

  tipo: {
    color: "#FFF",

    fontSize: 18,

    marginTop: 4,

    fontFamily:
      "PoppinsSemiBold",
  },

  priceBox: {
    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 18,
  },

  price: {
    color: "#FFF",

    fontSize: 16,

    fontFamily:
      "PoppinsBold",
  },

  infoContainer: {
    marginTop: 25,

    gap: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    color:
      "rgba(255,255,255,0.72)",

    marginLeft: 10,

    fontSize: 14,

    flex: 1,
  },

  /* BUTTON */
  button: {
    marginTop: 24,

    borderRadius: 22,

    paddingVertical: 18,

    justifyContent: "center",
    alignItems: "center",

    flexDirection: "row",

    gap: 10,

    shadowColor: "#7C3AED",

    shadowOpacity: 0.4,

    shadowRadius: 10,

    elevation: 8,
  },

  buttonText: {
    color: "#FFF",

    fontSize: 16,

    fontFamily:
      "PoppinsBold",
  },
});