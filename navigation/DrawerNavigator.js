import { createDrawerNavigator } from "@react-navigation/drawer";

import { Image, TouchableOpacity, ActivityIndicator, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

import TabNavigator from "./TabNavigator";
import CustomDrawerContent from "./CustomDrawerNavigator";
import PerfilStack from "./PerfilStack";
import AdmStack from "./AdmStack";
import MapaStack from "./MapaStack";

import Suporte from "../screens/TelaSuporte";
import TelaPainelCidade from "../screens/TelaPainelCidade";

import DrawerAvatar from "../components/DrawerAvatar";
import { Colors } from "../styles/Colors";

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
			screenOptions={({ navigation, route }) => ({
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
					marginLeft: -10,
				},

				drawerActiveBackgroundColor: "rgba(108,92,231,0.15)",

				/* 🎨 HEADER */
				headerShown: true,
				headerTitle: "",
				headerShadowVisible: false,

				headerStyle: {
					backgroundColor: Colors.background,
				},

				headerTintColor: Colors.primary,

				/* 👤 AVATAR */
				headerLeft: () => <DrawerAvatar navigation={navigation} />,
			})}
		>
			{/* 🏠 HOME */}
			<Drawer.Screen
				name="HomeTabs"
				component={TabNavigator}
				options={{
					drawerLabel: "Tela Inicial",

					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons
							name="home-variant-outline"
							color={color}
							size={size}
						/>
					),
				}}
			/>

			{/* 👤 PERFIL */}
			<Drawer.Screen
				name="Perfil"
				component={PerfilStack}
				options={{
					drawerLabel: "Meu Perfil",

					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons
							name="account-circle-outline"
							color={color}
							size={size}
						/>
					),
				}}
			/>

			{/* 🌆 PAINEL DA CIDADE */}
			<Drawer.Screen
				name="PainelCidade"
				component={TelaPainelCidade}
				options={{
					drawerLabel: () => null,
					title: null,

					drawerItemStyle: {
						display: "none",
					},
				}}
			/>

			{/* 🗺️ MAPA VIVO DA CULTURA */}
			<Drawer.Screen
				name="MapaVivo"
				component={MapaStack}
				options={{
					drawerLabel: () => null,
					title: null,

					drawerItemStyle: {
						display: "none",
					},
				}}
			/>

			{/* 📞 SUPORTE */}
			<Drawer.Screen
				name="Suporte"
				component={Suporte}
				options={{
					drawerLabel: "Suporte",

					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="lifebuoy" color={color} size={size} />
					),
				}}
			/>

			{/* 👑 ADMIN */}
			{isAdmin === true && (
				<Drawer.Screen
					name="Admin"
					component={AdmStack}
					options={{
						drawerLabel: "Área do Organizador",

						unmountOnBlur: true,

						drawerIcon: ({ color, size }) => (
							<MaterialCommunityIcons
								name="shield-crown-outline"
								color={color}
								size={size}
							/>
						),
					}}
				/>
			)}
		</Drawer.Navigator>
	);
}
