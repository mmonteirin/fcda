import React, {
	useState,
	useEffect,
} from "react";

import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	collection,
	addDoc,
	onSnapshot,
	query,
	orderBy,
	serverTimestamp,
	where,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

import { Colors } from "../styles/Colors";

import {
	getUserLikes,
	toggleEventoLike,
	incrementEventoViews,
} from "../services/eventosAppService";

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
		const palavraEscapada = palavra.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&"
		);

		const regex = new RegExp(
			`\\b${palavraEscapada}\\b`,
			"gi"
		);

		textoLimpo = textoLimpo.replace(
			regex,
			"*".repeat(palavra.length)
		);
	});

	return textoLimpo;
};

export default function EventoDetalhes({
	route,
	navigation,
}) {
	const { evento } = route.params;

	const insets = useSafeAreaInsets();

	const [comentario, setComentario] =
		useState("");

	const [notaSelecionada, setNotaSelecionada] =
		useState(0);

	const [avaliacoes, setAvaliacoes] =
		useState([]);

	const [loadingAval, setLoadingAval] =
		useState(true);

	const [enviando, setEnviando] =
		useState(false);

	const [jaAvaliou, setJaAvaliou] =
		useState(false);

	const [liked, setLiked] =
		useState(false);

	const [likesCount, setLikesCount] =
		useState(evento?.likes || 0);

	const [viewsCount, setViewsCount] =
		useState(evento?.views || 0);

	/* MODAL */
	const [modalVisible, setModalVisible] =
		useState(false);

	const [modalTitle, setModalTitle] =
		useState("");

	const [modalMessage, setModalMessage] =
		useState("");

	const eventoId =
		evento?.id || evento?.eventoId;

	const showModal = (
		title,
		message
	) => {
		setModalTitle(title);
		setModalMessage(message);
		setModalVisible(true);
	};

	/* ⭐ CARREGA AVALIAÇÕES */
	useEffect(() => {
		if (!eventoId) return;

		const q = query(
			collection(
				db,
				"eventos",
				eventoId,
				"avaliacoes"
			),
			orderBy("createdAt", "desc")
		);

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				const lista = snapshot.docs.map(
					(docu) => ({
						id: docu.id,
						...docu.data(),
					})
				);

				setAvaliacoes(lista);
				setLoadingAval(false);
			}
		);

		return () => unsub();
	}, [eventoId]);

	/* 🔍 VERIFICA */
	useEffect(() => {
		if (
			!eventoId ||
			!auth.currentUser
		)
			return;

		const check = async () => {
			const q = query(
				collection(
					db,
					"eventos",
					eventoId,
					"avaliacoes"
				),
				where(
					"userId",
					"==",
					auth.currentUser.uid
				)
			);

			const snap =
				await getDocs(q);

			setJaAvaliou(!snap.empty);
		};

		check();
	}, [eventoId]);

	/* ❤️ LIKES */
	useEffect(() => {
		if (!eventoId) return;

		const carregarLikes =
			async () => {
				if (!auth.currentUser)
					return;

				try {
					const ids =
						await getUserLikes(
							auth.currentUser.uid
						);

					setLiked(
						ids.includes(eventoId)
					);
				} catch (e) {
					console.log(e);
				}
			};

		carregarLikes();
	}, [eventoId]);

	/* 👁️ VIEWS */
	useEffect(() => {
		if (!eventoId) return;

		incrementEventoViews(
			eventoId
		).then(() => {
			setViewsCount(
				(prev) => prev + 1
			);
		});
	}, [eventoId]);

	const handleToggleLike =
		async () => {
			if (!auth.currentUser) {
				showModal(
					"Login necessário",
					"Faça login para curtir este evento."
				);

				return;
			}

			try {
				const novoStatus =
					!liked;

				await toggleEventoLike(
					eventoId,
					auth.currentUser.uid,
					novoStatus
				);

				setLiked(novoStatus);

				setLikesCount(
					(prev) =>
						prev +
						(novoStatus ? 1 : -1)
				);
			} catch (e) {
				console.log(e);

				showModal(
					"Erro",
					"Não foi possível atualizar o like."
				);
			}
		};

	/* 🚀 ENVIAR */
	const enviarAvaliacao =
		async () => {
			if (!comentario.trim()) {
				showModal(
					"Atenção",
					"Digite uma avaliação."
				);

				return;
			}

			if (!notaSelecionada) {
				showModal(
					"Atenção",
					"Selecione uma nota."
				);

				return;
			}

			if (jaAvaliou) {
				showModal(
					"Aviso",
					"Você já avaliou este evento."
				);

				return;
			}

			try {
				setEnviando(true);

				const user =
					auth.currentUser;

				const avaliacaoData = {
					userId: user.uid,

					nome:
						user.displayName ||
						"Anônimo",

					foto:
						user.photoURL ||
						"https://i.pravatar.cc/100",

					nota: notaSelecionada,

					comentario:
						censurarTexto(
							comentario.trim()
						),

					createdAt:
						serverTimestamp(),
				};

				const avaliacaoRef =
					await addDoc(
						collection(
							db,
							"eventos",
							eventoId,
							"avaliacoes"
						),
						avaliacaoData
					);

				await addDoc(
					collection(
						db,
						"users",
						user.uid,
						"avaliacoes"
					),
					{
						avaliacaoId:
							avaliacaoRef.id,

						...avaliacaoData,

						eventoId,

						tituloEvento:
							evento.tituloEvento ||
							"Evento",
					}
				);

				setComentario("");
				setNotaSelecionada(0);
				setJaAvaliou(true);

				showModal(
					"Sucesso",
					"Avaliação enviada!"
				);
			} catch (e) {
				console.log(e);

				showModal(
					"Erro",
					"Não foi possível enviar."
				);
			} finally {
				setEnviando(false);
			}
		};

	/* 🗑️ DELETAR */
	const deletarAvaliacao =
		async (avaliacaoId) => {
			try {
				const user =
					auth.currentUser;

				await deleteDoc(
					doc(
						db,
						"eventos",
						eventoId,
						"avaliacoes",
						avaliacaoId
					)
				);

				const q = query(
					collection(
						db,
						"users",
						user.uid,
						"avaliacoes"
					),
					where(
						"avaliacaoId",
						"==",
						avaliacaoId
					)
				);

				const snap =
					await getDocs(q);

				for (const documento of snap.docs) {
					await deleteDoc(
						doc(
							db,
							"users",
							user.uid,
							"avaliacoes",
							documento.id
						)
					);
				}

				setJaAvaliou(false);

				showModal(
					"Sucesso",
					"Avaliação removida."
				);
			} catch (e) {
				console.log(e);
			}
		};

	if (!evento) {
		return (
			<View style={styles.center}>
				<Text
					style={{
						color:
							Colors.textPrimary,
					}}
				>
					Evento não encontrado
				</Text>
			</View>
		);
	}

	const media =
		avaliacoes.length > 0
			? (
					avaliacoes.reduce(
						(acc, a) =>
							acc + a.nota,
						0
					) / avaliacoes.length
			  ).toFixed(1)
			: null;

	return (
		<View style={styles.container}>
			<ScrollView
				showsVerticalScrollIndicator={
					false
				}
				contentContainerStyle={{
					paddingBottom: 140,
				}}
			>
				{/* HERO */}
				<View>
					<Image
						source={{
							uri:
								evento.imagemEvento ||
								"https://placehold.co/600x300/121212/ffffff?text=Evento",
						}}
						style={styles.image}
					/>

					<LinearGradient
						colors={[
							"transparent",
							"rgba(0,0,0,0.95)",
						]}
						style={styles.overlay}
					/>

					<TouchableOpacity
						style={[
							styles.back,
							{
								top:
									insets.top +
									10,
							},
						]}
						onPress={() =>
							navigation.goBack()
						}
					>
						<MaterialCommunityIcons
							name="arrow-left"
							size={24}
							color="#fff"
						/>
					</TouchableOpacity>

					<View
						style={styles.headerText}
					>
						<Text
							style={styles.title}
						>
							{
								evento.tituloEvento
							}
						</Text>

						<Text
							style={styles.local}
						>
							📍{" "}
							{evento.localEvento ||
								"Local"}
						</Text>

						<View
							style={
								styles.metricRow
							}
						>
							<TouchableOpacity
								style={
									styles.likeButton
								}
								onPress={
									handleToggleLike
								}
							>
								<MaterialCommunityIcons
									name={
										liked
											? "heart"
											: "heart-outline"
									}
									size={18}
									color={
										liked
											? Colors.error
											: "#fff"
									}
								/>

								<Text
									style={
										styles.metricText
									}
								>
									{
										likesCount
									}
								</Text>
							</TouchableOpacity>

							<View
								style={
									styles.viewRow
								}
							>
								<MaterialCommunityIcons
									name="eye-outline"
									size={18}
									color="#fff"
								/>

								<Text
									style={
										styles.metricText
									}
								>
									{
										viewsCount
									}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* CONTEÚDO */}
				<View style={styles.content}>
					{/* DATA */}
					{evento.dataEvento ? (
						<View
							style={
								styles.infoPill
							}
						>
							<MaterialCommunityIcons
								name="calendar"
								size={16}
								color={
									Colors.primary
								}
							/>

							<Text
								style={
									styles.infoText
								}
							>
								{
									evento.dataEvento
								}
							</Text>
						</View>
					) : null}

					{/* DESCRIÇÃO */}
					<Text style={styles.section}>
						Descrição
					</Text>

					<Text
						style={
							styles.description
						}
					>
						{evento.descricao ||
							"Sem descrição"}
					</Text>

					{/* 🎟️ BOTÃO EVENTOINGRESSO */}
					<TouchableOpacity
						style={
							styles.experienciaBtn
						}
						activeOpacity={0.9}
						onPress={() =>
							navigation.navigate(
								"EventoIngresso",
								{
									evento,
								}
							)
						}
					>
						<LinearGradient
							colors={[
								"#7C3AED",
								"#A855F7",
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
								styles.experienciaGradient
							}
						>
							<View
								style={
									styles.experienciaIcon
								}
							>
								<MaterialCommunityIcons
									name="ticket-confirmation"
									size={22}
									color="#fff"
								/>
							</View>

							<View
								style={{
									flex: 1,
								}}
							>
								<Text
									style={
										styles.experienciaTitle
									}
								>
									Viver experiência cultural
								</Text>

								<Text
									style={
										styles.experienciaSubtitle
									}
								>
									Reserve sua participação neste evento
								</Text>
							</View>

							<MaterialCommunityIcons
								name="chevron-right"
								size={24}
								color="#fff"
							/>
						</LinearGradient>
					</TouchableOpacity>

					{/* 🚨 OCORRÊNCIA */}
					<TouchableOpacity
						style={
							styles.ocorrenciaBtn
						}
						onPress={() =>
							navigation.navigate(
								"NovaOcorrencia",
								{
									eventoId,
								}
							)
						}
					>
						<MaterialCommunityIcons
							name="alert-circle-outline"
							size={20}
							color="#fff"
						/>

						<Text
							style={
								styles.ocorrenciaText
							}
						>
							Declarar Ocorrência
						</Text>
					</TouchableOpacity>

					{/* ⭐ AVALIAÇÕES */}
					<View
						style={
							styles.avalSection
						}
					>
						<View
							style={
								styles.avalHeader
							}
						>
							<Text
								style={
									styles.section
								}
							>
								Avaliações
							</Text>

							{media ? (
								<Text
									style={
										styles.media
									}
								>
									⭐ {media}
								</Text>
							) : null}
						</View>

						{/* INPUT */}
						{!jaAvaliou ? (
							<View
								style={
									styles.avalInputBox
								}
							>
								<View
									style={
										styles.starsRow
									}
								>
									{[
										1,
										2,
										3,
										4,
										5,
									].map(
										(
											n
										) => (
											<TouchableOpacity
												key={
													n
												}
												onPress={() =>
													setNotaSelecionada(
														n
													)
												}
											>
												<Text
													style={[
														styles.star,
														{
															color:
																n <=
																notaSelecionada
																	? Colors.warning
																	: Colors.border,
														},
													]}
												>
													★
												</Text>
											</TouchableOpacity>
										)
									)}
								</View>

								<View
									style={
										styles.inputRow
									}
								>
									<TextInput
										placeholder="Escreva sua avaliação..."
										placeholderTextColor={
											Colors.textMuted
										}
										style={
											styles.input
										}
										value={
											comentario
										}
										onChangeText={
											setComentario
										}
										multiline
									/>

									<TouchableOpacity
										style={
											styles.sendBtn
										}
										onPress={
											enviarAvaliacao
										}
									>
										{enviando ? (
											<ActivityIndicator
												size="small"
												color="#fff"
											/>
										) : (
											<MaterialCommunityIcons
												name="send"
												size={20}
												color="#fff"
											/>
										)}
									</TouchableOpacity>
								</View>
							</View>
						) : (
							<View
								style={
									styles.jaAvaliadoBox
								}
							>
								<Text
									style={
										styles.jaAvaliadoText
									}
								>
									✅ Você já avaliou este evento
								</Text>
							</View>
						)}

						{/* LISTA */}
						{loadingAval ? (
							<ActivityIndicator
								size="small"
								color={
									Colors.primary
								}
							/>
						) : (
							<View
								style={
									styles.avalList
								}
							>
								{avaliacoes.map(
									(
										item
									) => (
										<View
											key={
												item.id
											}
											style={
												styles.avalCard
											}
										>
											<Image
												source={{
													uri:
														item.foto,
												}}
												style={
													styles.avalAvatar
												}
											/>

											<View
												style={{
													flex: 1,
												}}
											>
												<Text
													style={
														styles.avalNome
													}
												>
													{
														item.nome
													}
												</Text>

												<Text
													style={
														styles.avalTexto
													}
												>
													{
														item.comentario
													}
												</Text>
											</View>

											{item.userId ===
												auth
													.currentUser
													?.uid && (
												<TouchableOpacity
													onPress={() =>
														deletarAvaliacao(
															item.id
														)
													}
												>
													<MaterialCommunityIcons
														name="trash-can-outline"
														size={
															18
														}
														color={
															Colors.error
														}
													/>
												</TouchableOpacity>
											)}
										</View>
									)
								)}
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			{/* MODAL */}
			<Modal
				transparent
				animationType="fade"
				visible={modalVisible}
				onRequestClose={() =>
					setModalVisible(false)
				}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalBox}>
						<Text
							style={
								styles.modalTitle
							}
						>
							{modalTitle}
						</Text>

						<Text
							style={
								styles.modalMessage
							}
						>
							{modalMessage}
						</Text>

						<TouchableOpacity
							style={
								styles.modalButton
							}
							onPress={() =>
								setModalVisible(
									false
								)
							}
						>
							<Text
								style={
									styles.modalButtonText
								}
							>
								OK
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:
			Colors.background,
	},

	image: {
		width: "100%",
		height: 320,
	},

	overlay: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		height: 180,
	},

	back: {
		position: "absolute",
		left: 16,
		backgroundColor:
			"rgba(0,0,0,0.45)",
		padding: 10,
		borderRadius: 14,
	},

	headerText: {
		position: "absolute",
		bottom: 24,
		left: 16,
		right: 16,
	},

	title: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "800",
	},

	local: {
		color: "#ddd",
		fontSize: 14,
		marginTop: 4,
	},

	content: {
		padding: 18,
	},

	infoPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 10,
	},

	infoText: {
		color: Colors.textSecondary,
		fontSize: 13,
	},

	section: {
		color: Colors.textPrimary,
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 8,
		marginTop: 12,
	},

	description: {
		color: Colors.textSecondary,
		lineHeight: 22,
		fontSize: 14,
	},

	metricRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginTop: 12,
	},

	likeButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor:
			"rgba(255,255,255,0.18)",
		paddingVertical: 7,
		paddingHorizontal: 12,
		borderRadius: 16,
	},

	viewRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor:
			"rgba(255,255,255,0.12)",
		paddingVertical: 7,
		paddingHorizontal: 12,
		borderRadius: 16,
	},

	metricText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},

	/* EXPERIÊNCIA */
	experienciaBtn: {
		marginTop: 24,
		borderRadius: 24,
		overflow: "hidden",
		elevation: 10,
	},

	experienciaGradient: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 18,
		paddingHorizontal: 18,
	},

	experienciaIcon: {
		width: 52,
		height: 52,
		borderRadius: 18,
		backgroundColor:
			"rgba(255,255,255,0.18)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
	},

	experienciaTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "800",
	},

	experienciaSubtitle: {
		color:
			"rgba(255,255,255,0.75)",
		fontSize: 12,
		marginTop: 4,
	},

	/* OCORRÊNCIA */
	ocorrenciaBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor:
			Colors.error,
		padding: 15,
		borderRadius: 16,
		marginTop: 18,
		gap: 8,
	},

	ocorrenciaText: {
		color: "#fff",
		fontWeight: "700",
	},

	/* AVALIAÇÕES */
	avalSection: {
		marginTop: 26,
	},

	avalHeader: {
		flexDirection: "row",
		justifyContent:
			"space-between",
		alignItems: "center",
	},

	media: {
		color: Colors.warning,
		fontWeight: "bold",
	},

	avalInputBox: {
		backgroundColor:
			Colors.surface,
		borderRadius: 18,
		padding: 14,
		marginTop: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},

	starsRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 4,
		marginBottom: 12,
	},

	star: {
		fontSize: 30,
	},

	inputRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 8,
	},

	input: {
		flex: 1,
		backgroundColor:
			Colors.background,
		color: Colors.textPrimary,
		borderRadius: 14,
		padding: 12,
		minHeight: 60,
		borderWidth: 1,
		borderColor: Colors.border,
	},

	sendBtn: {
		backgroundColor:
			Colors.primary,
		padding: 14,
		borderRadius: 14,
	},

	jaAvaliadoBox: {
		backgroundColor:
			Colors.surface,
		padding: 14,
		borderRadius: 14,
		marginTop: 12,
		alignItems: "center",
	},

	jaAvaliadoText: {
		color: Colors.success,
		fontWeight: "700",
	},

	avalList: {
		marginTop: 16,
	},

	avalCard: {
		flexDirection: "row",
		gap: 10,
		backgroundColor:
			Colors.surface,
		padding: 12,
		borderRadius: 16,
		marginBottom: 10,
	},

	avalAvatar: {
		width: 42,
		height: 42,
		borderRadius: 21,
	},

	avalNome: {
		color: Colors.textPrimary,
		fontWeight: "700",
	},

	avalTexto: {
		color: Colors.textSecondary,
		fontSize: 13,
		marginTop: 4,
		lineHeight: 18,
	},

	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},

	/* MODAL */
	modalOverlay: {
		flex: 1,
		backgroundColor:
			"rgba(0,0,0,0.7)",
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},

	modalBox: {
		width: "100%",
		backgroundColor:
			Colors.surface,
		borderRadius: 24,
		padding: 24,
	},

	modalTitle: {
		color: Colors.textPrimary,
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 10,
	},

	modalMessage: {
		color: Colors.textSecondary,
		fontSize: 14,
		lineHeight: 22,
	},

	modalButton: {
		marginTop: 22,
		backgroundColor:
			Colors.primary,
		paddingVertical: 14,
		borderRadius: 16,
		alignItems: "center",
	},

	modalButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 15,
	},
});