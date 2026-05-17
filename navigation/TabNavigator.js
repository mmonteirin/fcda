import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  View,
  StyleSheet,
  Platform,
} from "react-native";

import { BlurView } from "expo-blur";

import AnimatedTabIcon from "./AnimatedTabIcon";

import HomeStack from "./HomeStack";
import BuscaStack from "./BuscaStack";
import FeedStack from "./FeedStack";
import EventoStack from "./EventoStack";
import PerfilStack from "./PerfilStack";

import { Colors } from "../styles/Colors";

const Tab = createBottomTabNavigator();

const colors = Colors;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        /* 🌌 TAB BAR */
        tabBarStyle: {
          position: "absolute",

          left: 16,
          right: 16,
          bottom: 18,

          height: 78,

          borderRadius: 30,

          borderTopWidth: 0,

          elevation: 0,

          backgroundColor: "transparent",

          shadowColor: colors.primary,

          shadowOffset: {
            width: 0,
            height: 10,
          },

          shadowOpacity: 0.22,

          shadowRadius: 20,
        },

        /* 🧊 GLASS EFFECT */
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="dark"
            style={styles.blur}
          />
        ),

        /* 📝 LABEL */
        tabBarLabelStyle: {
          fontSize: 11,

          fontWeight: "600",

          marginBottom: 6,

          marginTop: -2,
        },

        /* 🔥 ITEM */
        tabBarItemStyle: {
          paddingTop: 8,
        },

        /* 🎯 ÍCONES */
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case "Inicio":
              iconName = focused
                ? "home"
                : "home-outline";
              break;

            case "Busca":
              iconName = "magnify";
              break;

            case "Feed":
              iconName = "rss";
              break;

            case "Ingressos":
              iconName = focused
                ? "ticket"
                : "ticket-outline";
              break;

            case "Conta":
              iconName = focused
                ? "account"
                : "account-outline";
              break;
          }

          return (
            <View style={styles.iconContainer}>
              {/* ✨ GLOW */}
              {focused && (
                <>
                  <View style={styles.glow} />

                  <View style={styles.activePill} />
                </>
              )}

              <AnimatedTabIcon
                name={iconName}
                size={24}
                color={
                  focused
                    ? colors.primaryLight
                    : colors.textMuted
                }
                focused={focused}
              />
            </View>
          );
        },

        /* 🎨 CORES */
        tabBarActiveTintColor:
          colors.primaryLight,

        tabBarInactiveTintColor:
          colors.textMuted,
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
      />

      <Tab.Screen
        name="Busca"
        component={BuscaStack}
      />

      <Tab.Screen
        name="Feed"
        component={FeedStack}
      />

      <Tab.Screen
        name="Ingressos"
        component={EventoStack}
      />

      <Tab.Screen
        name="Conta"
        component={PerfilStack}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  /* 🌌 GLASS */
  blur: {
    flex: 1,

    borderRadius: 30,

    overflow: "hidden",

    backgroundColor:
      colors.surface + "DD",

    borderWidth: 1,

    borderColor:
      colors.glassBorder ||
      "rgba(255,255,255,0.08)",
  },

  /* 🎯 ÍCONES */
  iconContainer: {
    alignItems: "center",

    justifyContent: "center",
  },

  /* ✨ GLOW */
  glow: {
    position: "absolute",

    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor:
      colors.purpleGlow ||
      "rgba(108,92,231,0.25)",

    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.8,

    shadowRadius: 18,

    elevation: 12,
  },

  /* 🔥 PILL */
  activePill: {
    position: "absolute",

    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor:
      "rgba(108,92,231,0.18)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },
});