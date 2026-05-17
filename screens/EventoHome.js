import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  BlurView,
} from "expo-blur";

import {
  MotiView,
} from "moti";

import { Colors } from "../styles/Colors";

export default function EventoHome({
  navigation,
}) {
  const insets =
    useSafeAreaInsets();

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
      />

      {/* BACKGROUND */}
      <ImageBackground
        source={require("../assets/fundoTelaLogin.png")}
        style={styles.bg}
        resizeMode="cover"
      >

        {/* OVERLAY */}
        <LinearGradient
          colors={[
            "rgba(6,8,15,0.95)",
            "rgba(12,14,25,0.92)",
            "rgba(20,10,45,0.92)",
          ]}
          style={styles.overlay}
        >

          {/* HEADER */}
          <View
            style={[
              styles.header,
              {
                paddingTop:
                  insets.top + 10,
              },
            ]}
          >

            {/* VOLTAR */}
            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
              activeOpacity={0.8}
              style={styles.backButton}
            >

              <BlurView
                intensity={40}
                tint="dark"
                style={
                  styles.blurBtn
                }
              >

                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color="#FFF"
                />

              </BlurView>

            </TouchableOpacity>

            {/* TITULO */}
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
                type: "timing",
                duration: 700,
              }}
            >

              <Text style={styles.title}>
                Eventos 🎟️
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Explore experiências,
                cultura e eventos
                incríveis
              </Text>

            </MotiView>

          </View>

          {/* CONTENT */}
          <View style={styles.content}>

            {/* EVENTOS APP */}
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
                delay: 150,
                duration: 700,
              }}
            >

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(
                    "EventosApp"
                  )
                }
              >

                <LinearGradient
                  colors={[
                    "#7C3AED",
                    "#5B21B6",
                  ]}
                  style={
                    styles.iconBox
                  }
                >

                  <MaterialCommunityIcons
                    name="cellphone"
                    size={30}
                    color="#FFF"
                  />

                </LinearGradient>

                <View
                  style={
                    styles.textContainer
                  }
                >

                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    Eventos do App
                  </Text>

                  <Text
                    style={
                      styles.cardDesc
                    }
                  >
                    Eventos exclusivos
                    criados dentro da
                    plataforma
                  </Text>

                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color={
                    Colors.primary
                  }
                />

              </TouchableOpacity>

            </MotiView>

            {/* EVENTOS PUBLICOS */}
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
                delay: 300,
                duration: 700,
              }}
            >

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(
                    "EventosPublicos"
                  )
                }
              >

                <LinearGradient
                  colors={[
                    "#06B6D4",
                    "#2563EB",
                  ]}
                  style={
                    styles.iconBox
                  }
                >

                  <MaterialCommunityIcons
                    name="earth"
                    size={30}
                    color="#FFF"
                  />

                </LinearGradient>

                <View
                  style={
                    styles.textContainer
                  }
                >

                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    Eventos Culturais
                  </Text>

                  <Text
                    style={
                      styles.cardDesc
                    }
                  >
                    Eventos públicos,
                    culturais e oficiais
                  </Text>

                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color={
                    Colors.primary
                  }
                />

              </TouchableOpacity>

            </MotiView>

          </View>

        </LinearGradient>

      </ImageBackground>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#070B14",
  },

  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
  },

  /* HEADER */
  header: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 20,
  },

  backButton: {
    marginBottom: 25,
    alignSelf: "flex-start",
  },

  blurBtn: {
    width: 46,
    height: 46,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  title: {
    fontSize: 34,
    color: "#FFF",

    fontFamily:
      "PoppinsBold",

    letterSpacing: 0.5,
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.72)",

    marginTop: 10,

    fontSize: 15,

    lineHeight: 24,

    fontFamily:
      "PoppinsRegular",
  },

  /* CONTENT */
  content: {
    flex: 1,

    paddingHorizontal: 22,
    paddingTop: 10,
  },

  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderRadius: 28,

    padding: 18,

    marginBottom: 20,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",

    overflow: "hidden",
  },

  iconBox: {
    width: 64,
    height: 64,

    borderRadius: 22,

    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,

    marginLeft: 16,
    marginRight: 10,
  },

  cardTitle: {
    color: "#FFF",

    fontSize: 18,

    fontFamily:
      "PoppinsSemiBold",
  },

  cardDesc: {
    color:
      "rgba(255,255,255,0.65)",

    fontSize: 13,

    marginTop: 4,

    lineHeight: 20,

    fontFamily:
      "PoppinsRegular",
  },
});