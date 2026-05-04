import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import AnimatedTabIcon from "./AnimatedTabIcon";

import HomeStack from "./HomeStack";
import BuscaStack from "./BuscaStack";
import FeedStack from "./FeedStack";
import EventoStack from "./EventoStack";
import PerfilStack from "./PerfilStack";

import { BlurView } from "expo-blur";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        /* 🔥 CONTAINER */
        tabBarStyle: {
          position: "absolute",
          bottom: 18,
          left: 16,
          right: 16,
          height: 72,
          borderRadius: 28,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "transparent",
        },

        /* 🔥 FUNDO COM BLUR */
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              flex: 1,
              borderRadius: 28,
              overflow: "hidden",
              backgroundColor: colors.surface + "CC", // leve transparência
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        ),

        /* 🔥 LABEL */
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 6,
          marginTop: -2,
          color: colors.textSecondary,
        },

        /* 🔥 ITEM */
        tabBarItemStyle: {
          paddingVertical: 6,
        },

        /* 🔥 ÍCONE */
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case "Inicio":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Busca":
              iconName = "magnify";
              break;
            case "Feed":
              iconName = "rss";
              break;
            case "Ingressos":
              iconName = focused ? "ticket" : "ticket-outline";
              break;
            case "Conta":
              iconName = focused ? "account" : "account-outline";
              break;
          }

          return (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* 🔥 PILL ATIVA */}
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${colors.primary}25`, // 15% opacity
                  }}
                />
              )}

              <AnimatedTabIcon
                name={iconName}
                size={22}
                color={focused ? colors.primary : colors.textLight}
                focused={focused}
              />
            </View>
          );
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Busca" component={BuscaStack} />
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen name="Ingressos" component={EventoStack} />
      <Tab.Screen name="Conta" component={PerfilStack} />
    </Tab.Navigator>
  );
}
