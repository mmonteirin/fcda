import React, { useState } from "react";

import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  BlurView,
} from "expo-blur";

import {
  MotiView,
} from "moti";

import { Colors } from "../styles/Colors";

const eventosMock = [
  {
    id: "1",

    titulo: "Show de Rock",

    data: "25 Abr - 20:00",

    local: "Centro Cultural",

    status: "confirmado",

    imagem:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200",
  },

  {
    id: "2",

    titulo:
      "Festival de Forró",

    data: "28 Abr - 18:00",

    local:
      "Praia de Iracema",

    status: "pendente",

    imagem:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200",
  },
];

export default function TelaGerenciarEventos() {
  const [eventos, setEventos] =
    useState(eventosMock);

  const cancelarInscricao = (
    id
  ) => {
    Alert.alert(
      "Cancelar inscrição",
      "Deseja cancelar sua inscrição?",
      [
        {
          text: "Não",
          style: "cancel",
        },

        {
          text: "Sim",

          style: "destructive",

          onPress: () => {
            setEventos((prev) =>
              prev.filter(
                (item) =>
                  item.id !== id
              )
            );
          },
        },
      ]
    );
  };

  const renderItem = ({
    item,
    index,
  }) => {
    const confirmado =
      item.status ===
      "confirmado";

    return (
      <MotiView
        from={{
          opacity: 0,
          translateY: 25,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          type: "timing",
          duration: 500,
          delay: index * 120,
        }}
      >

        <View style={styles.card}>

          {/* IMAGEM */}
          <ImageBackground
            source={{
              uri: item.imagem,
            }}
            style={styles.imagem}
          >

            <LinearGradient
              colors={[
                "transparent",
                "rgba(0,0,0,0.95)",
              ]}
              style={
                styles.overlay
              }
            >

              {/* STATUS */}
              <View
                style={[
                  styles.status,

                  confirmado
                    ? styles.confirmado
                    : styles.pendente,
                ]}
              >

                <Text
                  style={
                    styles.statusText
                  }
                >
                  {confirmado
                    ? "Confirmado"
                    : "Pendente"}
                </Text>

              </View>

            </LinearGradient>

          </ImageBackground>

          {/* CONTEUDO */}
          <BlurView
            intensity={50}
            tint="dark"
            style={
              styles.conteudo
            }
          >

            <Text
              style={styles.titulo}
              numberOfLines={1}
            >
              {item.titulo}
            </Text>

            {/* DATA */}
            <View
              style={
                styles.infoRow
              }
            >

              <MaterialCommunityIcons
                name="calendar"
                size={17}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                {item.data}
              </Text>

            </View>

            {/* LOCAL */}
            <View
              style={
                styles.infoRow
              }
            >

              <MaterialCommunityIcons
                name="map-marker"
                size={17}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
                numberOfLines={1}
              >
                {item.local}
              </Text>

            </View>

            {/* ACTIONS */}
            <View
              style={
                styles.actions
              }
            >

              <TouchableOpacity
                activeOpacity={0.9}
                style={
                  styles.botaoEvento
                }
              >

                <LinearGradient
                  colors={[
                    "#7C3AED",
                    "#5B21B6",
                  ]}
                  style={
                    styles.gradientBtn
                  }
                >

                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={18}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.textoBtn
                    }
                  >
                    Ver Evento
                  </Text>

                </LinearGradient>

              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  cancelarInscricao(
                    item.id
                  )
                }
              >

                <Text
                  style={
                    styles.cancelar
                  }
                >
                  Cancelar
                </Text>

              </TouchableOpacity>

            </View>

          </BlurView>

        </View>

      </MotiView>
    );
  };

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          "#0F172A",
          "#111827",
          "#1E1B4B",
        ]}
        style={styles.header}
      >

        <Text style={styles.headerTitle}>
          Meus Eventos 🎟️
        </Text>

        <Text
          style={
            styles.headerSub
          }
        >
          Gerencie suas inscrições
        </Text>

      </LinearGradient>

      {/* LISTA */}
      <FlatList
        data={eventos}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={
          false
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >

            <MaterialCommunityIcons
              name="calendar-remove"
              size={70}
              color="rgba(255,255,255,0.15)"
            />

            <Text style={styles.empty}>
              Você ainda não se
              inscreveu em eventos
            </Text>

          </View>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#070B14",
  },

  /* HEADER */
  header: {
    paddingTop: 65,
    paddingBottom: 28,
    paddingHorizontal: 24,

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    color: "#FFF",

    fontSize: 30,

    fontWeight: "bold",
  },

  headerSub: {
    color:
      "rgba(255,255,255,0.7)",

    marginTop: 8,

    fontSize: 14,
  },

  /* CARD */
  card: {
    backgroundColor:
      "rgba(255,255,255,0.04)",

    borderRadius: 28,

    overflow: "hidden",

    marginBottom: 22,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  imagem: {
    height: 200,

    justifyContent: "flex-end",
  },

  overlay: {
    flex: 1,

    justifyContent: "flex-end",

    padding: 16,
  },

  conteudo: {
    padding: 18,
  },

  titulo: {
    color: "#FFF",

    fontSize: 21,

    fontWeight: "bold",

    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  infoText: {
    color:
      "rgba(255,255,255,0.72)",

    marginLeft: 8,

    fontSize: 13,

    flex: 1,
  },

  /* STATUS */
  status: {
    alignSelf: "flex-start",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 18,
  },

  confirmado: {
    backgroundColor:
      "rgba(34,197,94,0.95)",
  },

  pendente: {
    backgroundColor:
      "rgba(245,158,11,0.95)",
  },

  statusText: {
    color: "#FFF",

    fontSize: 12,

    fontWeight: "bold",
  },

  /* ACTIONS */
  actions: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginTop: 20,
  },

  botaoEvento: {
    borderRadius: 18,

    overflow: "hidden",
  },

  gradientBtn: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 12,
    paddingHorizontal: 18,

    gap: 8,
  },

  textoBtn: {
    color: "#FFF",

    fontWeight: "bold",

    fontSize: 13,
  },

  cancelar: {
    color: "#EF4444",

    fontWeight: "bold",

    fontSize: 14,
  },

  /* EMPTY */
  emptyContainer: {
    alignItems: "center",

    marginTop: 90,
  },

  empty: {
    color:
      "rgba(255,255,255,0.55)",

    marginTop: 18,

    textAlign: "center",

    fontSize: 15,
  },
});