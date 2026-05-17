import React, { useState } from "react";

import {
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	ImageBackground,
	StatusBar,
} from "react-native";

import {
	collection,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";

import {
	auth,
	db,
} from "../firebaseConfig";

import {
	MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
	LinearGradient,
} from "expo-linear-gradient";

import {
	useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
	BlurView,
} from "expo-blur";

import {
	MotiView,
} from "moti";

import AppText from "../components/AppText";

import {
	Colors,
} from "../styles/Colors";

const PALAVROES = [
	"porra",
	"poha",
	"caralho",
	"krl",
	"merda",
	"bosta",
	"puta",
	"vagabunda",
	"vadia",
	"prostituta",
	"cu",
	"buceta",
	"xereca",
	"foda",
	"fuder",
	"fodeu",
	"viado",
	"bicha",
	"bixona",
	"viadinho",
	"filho da puta",
	"fdp",
	"cacete",
	"arrombado",
	"desgraça",
	"desgraçado",
];

const censurarTexto = (texto) => {
	let textoLimpo = texto;

	PALAVROES.forEach((palavra) => {
		const palavraEscapada =
			palavra.replace(
				/[.*+?^${}()|[\]\\]/g,
				"\\$&"
			);

		const regex =
			new RegExp(
				`\\b${palavraEscapada}\\b`,
				"gi"
			);

		textoLimpo =
			textoLimpo.replace(
				regex,
				"*".repeat(
					palavra.length
				)
			);
	});

	return textoLimpo;
};

export default function PerfilDeclararOcorrencia({
	navigation,
	route,
}) {
	const {
		eventoId,
		nomeEvento,
	} = route.params;

	const insets =
		useSafeAreaInsets();

	const [descricao, setDescricao] =
		useState("");

	const [
		tipoSelecionado,
		setTipoSelecionado,
	] = useState(null);

	const [loading, setLoading] =
		useState(false);

	const tipos = [
		{
			id: "segurança",
			label: "Segurança",
			icon: "shield-alert",
			color: "#EF4444",
		},
		{
			id: "infraestrutura",
			label: "Infraestrutura",
			icon: "hammer-wrench",
			color: "#F59E0B",
		},
		{
			id: "comportamento",
			label: "Comportamento",
			icon: "account-alert",
			color: "#8B5CF6",
		},
		{
			id: "outro",
			label: "Outro",
			icon: "file-document-edit",
			color: "#3B82F6",
		},
	];

	const declarar = async () => {
		if (!descricao.trim()) {
			Alert.alert(
				"Atenção",
				"Descreva a ocorrência antes de enviar."
			);

			return;
		}

		try {
			setLoading(true);

			const user =
				auth.currentUser;

			const ocorrenciaData =
				{
					userId:
						user.uid,

					nome:
						user.displayName ||
						"Anônimo",

					local:
						nomeEvento ||
						"Local não definido",

					descricao:
						censurarTexto(
							descricao.trim()
						),

					tipo:
						tipoSelecionado ||
						"outro",

					createdAt:
						serverTimestamp(),
				};

			const ocorrenciaRef =
				await addDoc(
					collection(
						db,
						"eventos",
						eventoId,
						"ocorrencias"
					),

					ocorrenciaData
				);

			await addDoc(
				collection(
					db,
					"users",
					user.uid,
					"ocorrencias"
				),

				{
					ocorrenciaId:
						ocorrenciaRef.id,

					...ocorrenciaData,

					eventoId,

					tituloEvento:
						nomeEvento ||
						"Evento",
				}
			);

			Alert.alert(
				"Sucesso 🎉",
				"Ocorrência registrada!"
			);

			navigation.goBack();
		} catch (error) {
			console.log(error);

			Alert.alert(
				"Erro",
				"Não foi possível registrar."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar
				barStyle="light-content"
			/>

			{/* FUNDO */}
			<ImageBackground
				source={require("../assets/fundoTelaLogin.png")}
				style={styles.bg}
				blurRadius={12}
			>
				<View
					style={
						styles.overlay
					}
				/>

				{/* HEADER */}
				<LinearGradient
					colors={[
						"rgba(8,10,20,0.98)",
						"rgba(20,20,35,0.90)",
					]}
					style={[
						styles.header,
						{
							paddingTop:
								insets.top +
								10,
						},
					]}
				>
					<TouchableOpacity
						onPress={() =>
							navigation.goBack()
						}
						style={
							styles.backButton
						}
					>
						<MaterialCommunityIcons
							name="arrow-left"
							size={24}
							color="#fff"
						/>
					</TouchableOpacity>

					<AppText
						style={
							styles.headerTitle
						}
					>
						Declarar Ocorrência
					</AppText>

					<AppText
						style={
							styles.headerSub
						}
					>
						Reporte problemas do
						evento
					</AppText>
				</LinearGradient>

				<ScrollView
					showsVerticalScrollIndicator={
						false
					}
					contentContainerStyle={
						styles.content
					}
				>
					{/* EVENTO */}
					<MotiView
						from={{
							opacity: 0,
							translateY: 20,
						}}
						animate={{
							opacity: 1,
							translateY: 0,
						}}
					>
						<BlurView
							intensity={50}
							tint="dark"
							style={
								styles.card
							}
						>
							<View
								style={
									styles.row
								}
							>
								<View>
									<AppText
										style={
											styles.label
										}
									>
										Evento
									</AppText>

									<AppText
										style={
											styles.evento
										}
									>
										{nomeEvento ||
											"Evento"}
									</AppText>
								</View>

								<View
									style={
										styles.iconBox
									}
								>
									<MaterialCommunityIcons
										name="alert-circle"
										size={24}
										color={
											Colors.primary
										}
									/>
								</View>
							</View>
						</BlurView>
					</MotiView>

					{/* TIPOS */}
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
							delay: 120,
						}}
					>
						<BlurView
							intensity={40}
							tint="dark"
							style={
								styles.card
							}
						>
							<AppText
								style={
									styles.label
								}
							>
								Tipo de ocorrência
							</AppText>

							<View
								style={
									styles.grid
								}
							>
								{tipos.map(
									(tipo) => {
										const ativo =
											tipoSelecionado ===
											tipo.id;

										return (
											<TouchableOpacity
												key={
													tipo.id
												}
												activeOpacity={
													0.9
												}
												onPress={() =>
													setTipoSelecionado(
														tipo.id
													)
												}
												style={[
													styles.tipoCard,

													ativo && {
														borderColor:
															tipo.color,

														backgroundColor: `${tipo.color}25`,
													},
												]}
											>
												<MaterialCommunityIcons
													name={
														tipo.icon
													}
													size={
														24
													}
													color={
														ativo
															? tipo.color
															: "#aaa"
													}
												/>

												<AppText
													style={[
														styles.tipoText,

														ativo && {
															color:
																tipo.color,
														},
													]}
												>
													{
														tipo.label
													}
												</AppText>
											</TouchableOpacity>
										);
									}
								)}
							</View>
						</BlurView>
					</MotiView>

					{/* DESCRIÇÃO */}
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
							delay: 220,
						}}
					>
						<BlurView
							intensity={45}
							tint="dark"
							style={
								styles.card
							}
						>
							<AppText
								style={
									styles.label
								}
							>
								Detalhes da ocorrência
							</AppText>

							<TextInput
								value={
									descricao
								}
								onChangeText={
									setDescricao
								}
								multiline
								placeholder="Explique detalhadamente o que aconteceu..."
								placeholderTextColor="#777"
								style={
									styles.input
								}
							/>

							<View
								style={
									styles.counter
								}
							>
								<AppText
									style={
										styles.counterText
									}
								>
									{
										descricao.length
									}
									/500
								</AppText>
							</View>
						</BlurView>
					</MotiView>

					{/* ALERTA */}
					<View
						style={
							styles.warningCard
						}
					>
						<MaterialCommunityIcons
							name="shield-check"
							size={18}
							color="#22C55E"
						/>

						<AppText
							style={
								styles.warningText
							}
						>
							Sua denúncia será
							analisada pela equipe
							de organização.
						</AppText>
					</View>

					{/* BOTÃO */}
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={declarar}
						disabled={loading}
						style={
							styles.buttonContainer
						}
					>
						<LinearGradient
							colors={[
								Colors.primary,
								"#7C3AED",
							]}
							style={
								styles.button
							}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<>
									<MaterialCommunityIcons
										name="send"
										size={20}
										color="#fff"
									/>

									<AppText
										style={
											styles.buttonText
										}
									>
										Enviar Ocorrência
									</AppText>
								</>
							)}
						</LinearGradient>
					</TouchableOpacity>
				</ScrollView>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#060816",
	},

	bg: {
		flex: 1,
	},

	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor:
			"rgba(5,8,18,0.82)",
	},

	header: {
		paddingHorizontal: 20,
		paddingBottom: 25,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
	},

	backButton: {
		width: 42,
		height: 42,
		borderRadius: 14,
		backgroundColor:
			"rgba(255,255,255,0.08)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 18,
	},

	headerTitle: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "bold",
	},

	headerSub: {
		color:
			"rgba(255,255,255,0.70)",
		marginTop: 6,
		fontSize: 14,
	},

	content: {
		padding: 18,
		paddingBottom: 50,
	},

	card: {
		borderRadius: 24,
		padding: 18,
		marginBottom: 18,
		overflow: "hidden",
		borderWidth: 1,
		borderColor:
			"rgba(255,255,255,0.08)",
	},

	row: {
		flexDirection: "row",
		justifyContent:
			"space-between",
		alignItems: "center",
	},

	label: {
		color: "#8B93A7",
		fontSize: 13,
		marginBottom: 8,
	},

	evento: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},

	iconBox: {
		width: 52,
		height: 52,
		borderRadius: 16,
		backgroundColor:
			"rgba(124,58,237,0.15)",
		justifyContent: "center",
		alignItems: "center",
	},

	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginTop: 5,
	},

	tipoCard: {
		width: "47%",
		paddingVertical: 16,
		borderRadius: 18,
		borderWidth: 1,
		borderColor:
			"rgba(255,255,255,0.08)",
		backgroundColor:
			"rgba(255,255,255,0.03)",
		alignItems: "center",
	},

	tipoText: {
		color: "#aaa",
		fontSize: 13,
		marginTop: 10,
		fontWeight: "600",
	},

	input: {
		height: 160,
		borderRadius: 18,
		padding: 16,
		color: "#fff",
		fontSize: 15,
		backgroundColor:
			"rgba(255,255,255,0.04)",
		borderWidth: 1,
		borderColor:
			"rgba(255,255,255,0.06)",
		textAlignVertical: "top",
	},

	counter: {
		alignItems: "flex-end",
		marginTop: 8,
	},

	counterText: {
		color: "#777",
		fontSize: 11,
	},

	warningCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor:
			"rgba(34,197,94,0.10)",
		borderWidth: 1,
		borderColor:
			"rgba(34,197,94,0.25)",
		padding: 14,
		borderRadius: 16,
		marginBottom: 22,
	},

	warningText: {
		color: "#D1D5DB",
		fontSize: 12,
		flex: 1,
		lineHeight: 18,
	},

	buttonContainer: {
		borderRadius: 20,
		overflow: "hidden",
	},

	button: {
		paddingVertical: 18,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 10,
	},

	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});