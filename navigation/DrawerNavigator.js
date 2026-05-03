import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  Image,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

import TabNavigator from "./TabNavigator";
import CustomDrawerContent from "./CustomDrawerNavigator";
import PerfilStack from "./PerfilStack";
import AdmStack from "./AdmStack";
import Suporte from "../screens/TelaSuporte";

import { Colors } from "../styles/Colors"; // ✅ PADRÃO NOVO

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { isAdmin, foto, user, loading } = useAuth();

  // 🔄 LOADING GLOBAL
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Drawer.Navigator
      key={isAdmin ? "admin" : "user"}
      initialRouteName="HomeTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: "slide",
        swipeEnabled: true,
        overlayColor: "transparent",

        /* 🎨 DRAWER */
        drawerStyle: {
          backgroundColor: Colors.surface,
          width: "75%",
        },

        sceneContainerStyle: {
          backgroundColor: Colors.background,
        },

        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,

        drawerLabelStyle: {
          fontSize: 15,
        },

        drawerActiveBackgroundColor: "rgba(108,92,231,0.15)", // primary com opacidade

        /* 🎨 HEADER */
        headerShown: true,
        headerTitle: "",
        headerShadowVisible: false,

        headerStyle: {
          backgroundColor: Colors.background,
        },

        headerTintColor: Colors.primary,

        /* 👤 AVATAR */
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              source={{
                uri:
                  foto ||
                  user?.photoURL ||
                  "https://i.pravatar.cc/100",
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 20,
                marginLeft: 15,
                borderWidth: 2,
                borderColor: Colors.primary,
              }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      {/* 🏠 HOME */}
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{ drawerLabel: "Tela Inicial" }}
      />

      {/* 👤 PERFIL */}
      <Drawer.Screen
        name="Perfil"
        component={PerfilStack}
        options={{ drawerLabel: "Meu Perfil" }}
      />

      {/* 📞 SUPORTE */}
      <Drawer.Screen
        name="Suporte"
        component={Suporte}
        options={{ drawerLabel: "Suporte" }}
      />

      {/* 👑 ADMIN */}
      {isAdmin === true && (
        <Drawer.Screen
          name="Admin"
          component={AdmStack}
          options={{
            drawerLabel: "Área do Organizador",
            unmountOnBlur: true,
          }}
        />
      )}
    </Drawer.Navigator>
  );
}
