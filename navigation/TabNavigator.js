import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
	View,
	Text,
	StyleSheet,
	Platform,
	TouchableOpacity,
} from "react-native";

import Animated, {
	FadeIn,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

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
	onPress,
}) {
	const scale = useSharedValue(
		focused ? 1 : 0.95
	);

	const animatedStyle =
		useAnimatedStyle(() => ({
			transform: [
				{
					scale: scale.value,
				},
			],
		}));

	React.useEffect(() => {
		scale.value = withSpring(
			focused ? 1 : 0.95,
			{
				damping: 12,
				stiffness: 120,
			}
		);
	}, [focused]);

	return (
		<TouchableOpacity
			activeOpacity={0.9}
			onPress={onPress}
			style={styles.touchable}
		>
			<Animated.View
				style={[
					styles.tabItem,
					animatedStyle,
				]}
			>
				{/* ACTIVE GLOW */}
				{focused && (
					<Animated.View
						entering={FadeIn.duration(
							250
						)}
						style={
							styles.glowWrapper
						}
					>
						<LinearGradient
							colors={[
								colors.primary +
									"55",
								"transparent",
							]}
							start={{
								x: 0.2,
								y: 0,
							}}
							end={{
								x: 1,
								y: 1,
							}}
							style={
								styles.glow
							}
						/>
					</Animated.View>
				)}

				{/* ACTIVE BACKGROUND */}
				{focused && (
					<LinearGradient
						colors={[
							colors.primary,
							colors.primaryLight ||
								colors.primary,
						]}
						start={{
							x: 0,
							y: 0,
						}}
						end={{
							x: 1,
							y: 1,
						}}
						style={
							styles.activeBackground
						}
					/>
				)}

				{/* ICON */}
				<View
					style={[
						styles.iconWrapper,

						focused &&
							styles.iconWrapperActive,
					]}
				>
					<MaterialCommunityIcons
						name={icon}
						size={
							focused ? 24 : 22
						}
						color={
							focused
								? "#fff"
								: colors.textMuted
						}
					/>
				</View>

				{/* LABEL */}
				<Text
					numberOfLines={1}
					style={[
						styles.label,

						{
							color:
								focused
									? "#FFF"
									: colors.textMuted,

							opacity:
								focused
									? 1
									: 0.72,
						},
					]}
				>
					{label}
				</Text>

				{/* ACTIVE DOT */}
				{focused && (
					<Animated.View
						entering={FadeIn.duration(
							200
						)}
						style={styles.dot}
					/>
				)}
			</Animated.View>
		</TouchableOpacity>
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

				tabBarStyle: {
					position: "absolute",

					left: 14,
					right: 14,

					bottom:
						Platform.OS === "ios"
							? insets.bottom + 8
							: 14,

					height: 86,

					paddingTop: 8,

					borderRadius: 34,

					borderTopWidth: 0,

					backgroundColor:
						"transparent",

					elevation: 0,

					shadowColor: "#000",

					shadowOffset: {
						width: 0,
						height: 10,
					},

					shadowOpacity: 0.18,

					shadowRadius: 20,
				},

				/* GLASS BACKGROUND */
				tabBarBackground: () => (
					<View
						style={
							StyleSheet.absoluteFill
						}
					>
						<BlurView
							intensity={90}
							tint="dark"
							style={
								styles.blurContainer
							}
						>
							<LinearGradient
								colors={[
									"rgba(255,255,255,0.04)",
									"rgba(255,255,255,0.01)",
								]}
								style={
									StyleSheet.absoluteFill
								}
							/>

							<View
								style={
									styles.overlay
								}
							/>
						</BlurView>
					</View>
				),

				/* TAB BUTTON */
				tabBarButton: (
					props
				) => {
					const {
						accessibilityState,
						onPress,
					} = props;

					const focused =
						accessibilityState?.selected;

					let iconName;
					let label;

					switch (route.name) {
						case "Inicio":
							iconName =
								focused
									? "home"
									: "home-outline";
							label = "Início";
							break;

						case "Busca":
							iconName =
								focused
									? "magnify"
									: "magnify";
							label = "Busca";
							break;

						case "Feed":
							iconName =
								focused
									? "compass"
									: "compass-outline";
							label = "Feed";
							break;

						case "Ingressos":
							iconName =
								focused
									? "ticket-confirmation"
									: "ticket-confirmation-outline";
							label = "Tickets";
							break;

						case "Comunidade":
							iconName =
								focused
									? "account-group"
									: "account-group-outline";
							label =
								"Comunidade";
							break;

						case "Conta":
							iconName =
								focused
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
							onPress={onPress}
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
				component={
					ComunidadeStack
				}
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

		borderRadius: 34,

		overflow: "hidden",

		borderWidth: 1,

		borderColor:
			"rgba(255,255,255,0.08)",

		backgroundColor:
			"rgba(12,12,18,0.88)",
	},

	overlay: {
		flex: 1,

		backgroundColor:
			"rgba(18,18,28,0.45)",
	},

	/* TAB BUTTON */
	touchable: {
		flex: 1,

		alignItems: "center",

		justifyContent: "center",
	},

	tabItem: {
		width: 68,

		alignItems: "center",

		justifyContent: "center",

		paddingTop: 4,
	},

	/* GLOW */
	glowWrapper: {
		position: "absolute",

		top: -4,
	},

	glow: {
		width: 72,
		height: 72,

		borderRadius: 999,
	},

	/* ACTIVE BG */
	activeBackground: {
		position: "absolute",

		top: -2,

		width: 56,
		height: 56,

		borderRadius: 20,

		opacity: 0.22,
	},

	/* ICON */
	iconWrapper: {
		width: 48,
		height: 48,

		borderRadius: 18,

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
			height: 8,
		},

		shadowOpacity: 0.4,

		shadowRadius: 16,

		elevation: 10,
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