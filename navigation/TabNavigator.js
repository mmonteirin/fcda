import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
	View,
	Text,
	StyleSheet,
	Platform,
} from "react-native";

import { BlurView } from "expo-blur";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeStack from "./HomeStack";
import BuscaStack from "./BuscaStack";
import FeedStack from "./FeedStack";
import EventoStack from "./EventoStack";
import PerfilStack from "./PerfilStack";
import ComunidadeStack from "./ComunidadeStack";

import { Colors } from "../styles/Colors";

const Tab = createBottomTabNavigator();

const colors = Colors;

function CustomTabIcon({
	focused,
	icon,
	label,
}) {
	return (
		<View style={styles.tabItem}>
			{/* ACTIVE BACKGROUND */}
			{focused && (
				<LinearGradient
					colors={[
						colors.primary,
						colors.primaryLight ||
							colors.primary,
					]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.activeBackground}
				/>
			)}

			{/* ICON */}
			<View
				style={[
					styles.iconWrapper,

					focused && styles.iconWrapperActive,
				]}
			>
				<MaterialCommunityIcons
					name={icon}
					size={22}
					color={
						focused
							? "#fff"
							: colors.textMuted
					}
				/>
			</View>

			{/* LABEL */}
			<Text
				style={[
					styles.label,

					{
						color: focused
							? colors.textPrimary
							: colors.textMuted,
					},
				]}
			>
				{label}
			</Text>

			{/* INDICATOR */}
			{focused && <View style={styles.dot} />}
		</View>
	);
}

export default function TabNavigator() {
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,

				tabBarShowLabel: false,

				tabBarHideOnKeyboard: true,

				/* TAB BAR */
				tabBarStyle: {
					position: "absolute",

					left: 18,
					right: 18,

					bottom:
						Platform.OS === "ios"
							? insets.bottom + 10
							: 18,

					height: 82,

					paddingTop: 10,

					borderRadius: 30,

					borderTopWidth: 0,

					backgroundColor: "transparent",

					elevation: 0,

					shadowColor: "#000",

					shadowOffset: {
						width: 0,
						height: 10,
					},

					shadowOpacity: 0.2,

					shadowRadius: 25,
				},

				/* GLASS EFFECT */
				tabBarBackground: () => (
					<BlurView
						intensity={80}
						tint="dark"
						style={styles.blurContainer}
					>
						<View style={styles.overlay} />
					</BlurView>
				),

				/* ICON */
				tabBarIcon: ({ focused }) => {
					let iconName;
					let label;

					switch (route.name) {
						case "Inicio":
							iconName = focused
								? "home"
								: "home-outline";
							label = "Início";
							break;

						case "Busca":
							iconName = focused
								? "magnify"
								: "magnify";
							label = "Busca";
							break;

						case "Feed":
							iconName = focused
								? "compass"
								: "compass-outline";
							label = "Feed";
							break;

						case "Ingressos":
							iconName = focused
								? "ticket-confirmation"
								: "ticket-confirmation-outline";
							label = "Tickets";
							break;

						case "Comunidade":
							iconName = focused
								? "people"
								: "people-outline";
							label = "Comunidade";
							break;

						case "Conta":
							iconName = focused
								? "account"
								: "account-outline";
							label = "Perfil";
							break;
					}

					return (
						<CustomTabIcon
							focused={focused}
							icon={iconName}
							label={label}
						/>
					);
				},
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
				name="Comunidade"
				component={ComunidadeStack}
			/>

			<Tab.Screen
				name="Conta"
				component={PerfilStack}
			/>
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	/* BLUR */
	blurContainer: {
		flex: 1,

		borderRadius: 30,

		overflow: "hidden",

		borderWidth: 1,

		borderColor:
			colors.glassBorder ||
			"rgba(255,255,255,0.06)",

		backgroundColor: "rgba(15,15,20,0.82)",
	},

	overlay: {
		flex: 1,

		backgroundColor:
			colors.surface + "CC",
	},

	/* TAB ITEM */
	tabItem: {
		width: 68,

		alignItems: "center",

		justifyContent: "center",

		paddingTop: 6,
	},

	/* ACTIVE BG */
	activeBackground: {
		position: "absolute",

		top: -2,

		width: 58,
		height: 58,

		borderRadius: 20,

		opacity: 0.18,
	},

	/* ICON */
	iconWrapper: {
		width: 46,
		height: 46,

		borderRadius: 16,

		alignItems: "center",
		justifyContent: "center",
	},

	iconWrapperActive: {
		backgroundColor:
			colors.primary ||
			"#6C5CE7",

		shadowColor:
			colors.primary ||
			"#6C5CE7",

		shadowOffset: {
			width: 0,
			height: 6,
		},

		shadowOpacity: 0.35,

		shadowRadius: 12,

		elevation: 8,
	},

	/* LABEL */
	label: {
		fontSize: 11,

		fontWeight: "700",

		marginTop: 5,
	},

	/* DOT */
	dot: {
		width: 5,
		height: 5,

		borderRadius: 999,

		backgroundColor:
			colors.primaryLight ||
			colors.primary,

		marginTop: 4,
	},
});