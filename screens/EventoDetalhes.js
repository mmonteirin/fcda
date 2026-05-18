import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	TextInput,
	StyleSheet,
	Alert,
	ActivityIndicator,
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
		// escapa caracteres especiais
		const palavraEscapada = palavra.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&"
		);

		// pega apenas palavra isolada
		const regex = new RegExp(`\\b${palavraEscapada}\\b`, "gi");

		textoLimpo = textoLimpo.replace(
			regex,
			"*".repeat(palavra.length)
		);
	});

	return textoLimpo;
};

export default function EventoDetalhes({ route, navigation }) {
	const { evento } = route.params;
	const insets = useSafeAreaInsets();

	const [comentario, setComentario] = useState("");
	const [notaSelecionada, setNotaSelecionada] = useState(0);
	const [avaliacoes, setAvaliacoes] = useState([]);
	const [loadingAval, setLoadingAval] = useState(true);
	const [enviando, setEnviando] = useState(false);
	const [jaAvaliou, setJaAvaliou] = useState(false);
	const [liked, setLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(evento?.likes || 0);
	const [viewsCount, setViewsCount] = useState(evento?.views || 0);

	// O eventoId pode vir como evento.id (quando vem do feed) ou evento.eventoId
	const eventoId = evento?.id || evento?.eventoId;

	/* ⭐ CARREGA AVALIAÇÕES EM TEMPO REAL */
	useEffect(() => {
		if (!eventoId) return;

		const q = query(
			collection(db, "eventos", eventoId, "avaliacoes"),
			orderBy("createdAt", "desc")
		);

		const unsub = onSnapshot(q, (snapshot) => {
			const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
			setAvaliacoes(lista);
			setLoadingAval(false);
		});

		return () => unsub();
	}, [eventoId]);

	/* 🔍 VERIFICA SE JÁ AVALIOU */
	useEffect(() => {
		if (!eventoId || !auth.currentUser) return;

		const check = async () => {
			const q = query(
				collection(db, "eventos", eventoId, "avaliacoes"),
				where("userId", "==", auth.currentUser.uid)
			);
			const snap = await getDocs(q);
			setJaAvaliou(!snap.empty);
		};

		check();
	}, [eventoId]);

	useEffect(() => {
		if (!eventoId) return;

		const carregarDadosMetricas = async () => {
			if (!auth.currentUser) return;

			try {
				const ids = await getUserLikes(auth.currentUser.uid);
				setLiked(ids.includes(eventoId));
			} catch (error) {
				console.log("Erro ao verificar like:", error);
			}
		};

		carregarDadosMetricas();
	}, [eventoId]);

	useEffect(() => {
		if (!eventoId) return;

		incrementEventoViews(eventoId).then(() => {
			setViewsCount((prev) => prev + 1);
		});
	}, [eventoId]);

	useEffect(() => {
		setLikesCount(evento?.likes || 0);
		setViewsCount(evento?.views || 0);
	}, [evento?.likes, evento?.views]);

	const handleToggleLike = async () => {
		if (!auth.currentUser) {
			Alert.alert("Login necessário", "Faça login para curtir este evento.");
			return;
		}

		try {
			const novoStatus = !liked;
			await toggleEventoLike(eventoId, auth.currentUser.uid, novoStatus);
			setLiked(novoStatus);
			setLikesCount((prev) => prev + (novoStatus ? 1 : -1));
		} catch (error) {
			console.log("Erro no like:", error);
			Alert.alert("Erro", "Não foi possível atualizar seu like.");
		}
	};

	/* 🚀 ENVIA AVALIAÇÃO */
	const enviarAvaliacao = async () => {
		if (!comentario.trim()) {
			Alert.alert("Atenção", "Digite um texto de avaliação.");
			return;
		}
		if (!notaSelecionada) {
			Alert.alert("Atenção", "Selecione uma nota de 1 a 5.");
			return;
		}
		if (jaAvaliou) {
			Alert.alert("Aviso", "Você já avaliou este evento.");
			return;
		}

		try {
			setEnviando(true);
			const user = auth.currentUser;

			// Campos alinhados com o que já existe no banco (Image 1)
			const avaliacaoData = {
				userId: user.uid,
				nome: user.displayName || "Anônimo",
				foto: user.photoURL || "https://i.pravatar.cc/100",
				nota: notaSelecionada,
				comentario: censurarTexto(comentario.trim()),
				createdAt: serverTimestamp(),
			};

			// 1️⃣ Subcoleção do evento (já existe no banco: eventos/{id}/avaliacoes)
			const avaliacaoRef = await addDoc(
				collection(db, "eventos", eventoId, "avaliacoes"),
				avaliacaoData
			);

			// 2️⃣ Histórico pessoal do usuário (users/{uid}/avaliacoes)
			await addDoc(collection(db, "users", user.uid, "avaliacoes"), {
				avaliacaoId: avaliacaoRef.id,
				...avaliacaoData,
				eventoId,
				// campos de referência para exibir no histórico
				tituloEvento: evento.tituloEvento || "Evento",
				localEvento: evento.localEvento || "",
				dataEvento: evento.dataEvento || "",
			});

			setComentario("");
			setNotaSelecionada(0);
			setJaAvaliou(true);
			Alert.alert("Sucesso", "Avaliação enviada!");
		} catch (e) {
			console.log("Erro ao enviar avaliação:", e);
			Alert.alert("Erro", "Não foi possível enviar a avaliação.");
		} finally {
			setEnviando(false);
		}
	};

	/* 🗑️ DELETAR AVALIAÇÃO */
	const deletarAvaliacao = async (avaliacaoId) => {
		try {
			const user = auth.currentUser;

			// 1️⃣ remove do evento
			await deleteDoc(doc(db, "eventos", eventoId, "avaliacoes", avaliacaoId));

			// 2️⃣ procura no histórico pessoal
			const q = query(
				collection(db, "users", user.uid, "avaliacoes"),
				where("avaliacaoId", "==", avaliacaoId)
			);

			const snap = await getDocs(q);

			// 3️⃣ remove do histórico
			for (const documento of snap.docs) {
				await deleteDoc(doc(db, "users", user.uid, "avaliacoes", documento.id));
			}

			setJaAvaliou(false);

			Alert.alert("Sucesso", "Avaliação removida.");
		} catch (e) {
			console.log(e);
			Alert.alert("Erro", "Não foi possível apagar.");
		}
	};

	if (!evento) {
		return (
			<View style={styles.center}>
				<Text style={{ color: Colors.textPrimary }}>Evento não encontrado</Text>
			</View>
		);
	}

	const media =
		avaliacoes.length > 0
			? (
					avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
				).toFixed(1)
			: null;

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
				{/* ── HERO IMAGE ── */}
				<View>
					{/* imagemEvento */}
					<Image
						source={{
							uri:
								typeof evento.imagemEvento === "string"
									? evento.imagemEvento
									: "https://placehold.co/600x300/121212/ffffff?text=Evento",
						}}
						style={styles.image}
					/>
					<LinearGradient
						colors={["transparent", "rgba(0,0,0,0.9)"]}
						style={styles.overlay}
					/>

					<TouchableOpacity
						style={[styles.back, { top: insets.top + 10 }]}
						onPress={() => navigation.goBack()}
					>
						<MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
					</TouchableOpacity>

					<View style={styles.headerText}>
						{/* tituloEvento */}
						<Text style={styles.title}>{evento.tituloEvento}</Text>
						{/* localEvento */}
						<Text style={styles.local}>
							📍 {evento.localEvento || evento.nomeLocal || "—"}
						</Text>
								<View style={styles.metricRow}>
									<TouchableOpacity style={styles.likeButton} onPress={handleToggleLike}>
										<MaterialCommunityIcons
											name={liked ? "heart" : "heart-outline"}
											size={18}
											color={liked ? Colors.error : "#fff"}
										/>
										<Text style={styles.metricText}>{likesCount}</Text>
									</TouchableOpacity>
									<View style={styles.viewRow}>
										<MaterialCommunityIcons
											name="eye-outline"
											size={18}
											color="#fff"
										/>
										<Text style={styles.metricText}>{viewsCount}</Text>
									</View>
								</View>
					</View>
				</View>

				{/* ── CONTEÚDO ── */}
				<View style={styles.content}>
					{/* dataEvento */}
					{evento.dataEvento ? (
						<View style={styles.infoPill}>
							<MaterialCommunityIcons
								name="calendar"
								size={16}
								color={Colors.primary}
							/>
							<Text style={styles.infoText}>{evento.dataEvento}</Text>
						</View>
					) : null}

					{evento.horaInicio ? (
						<View style={styles.infoPill}>
							<MaterialCommunityIcons
								name="clock-outline"
								size={16}
								color={Colors.primary}
							/>
							<Text style={styles.infoText}>
								{evento.horaInicio}
								{evento.horaFim ? ` — ${evento.horaFim}` : ""}
							</Text>
						</View>
					) : null}

					<Text style={styles.section}>Descrição</Text>
					<Text style={styles.description}>
						{evento.descricao || "Sem descrição"}
					</Text>

					{/* ── BOTÃO DECLARAR OCORRÊNCIA ── */}
					<TouchableOpacity
						style={styles.ocorrenciaBtn}
						onPress={() =>
							navigation.navigate("NovaOcorrencia", {
								eventoId,
								nomeEvento: evento.tituloEvento || "Evento", // passa tituloEvento
							})
						}
					>
						<MaterialCommunityIcons
							name="alert-circle-outline"
							size={20}
							color="#fff"
						/>
						<Text style={styles.ocorrenciaText}>Declarar Ocorrência</Text>
					</TouchableOpacity>

					{/* ── AVALIAÇÕES ── */}
					<View style={styles.avalSection}>
						<View style={styles.avalHeader}>
							<Text style={styles.section}>Avaliações</Text>
							{media ? <Text style={styles.media}>⭐ {media}</Text> : null}
						</View>

						{/* INPUT */}
						{!jaAvaliou ? (
							<View style={styles.avalInputBox}>
								<View style={styles.starsRow}>
									{[1, 2, 3, 4, 5].map((n) => (
										<TouchableOpacity
											key={n}
											onPress={() => setNotaSelecionada(n)}
										>
											<Text
												style={[
													styles.star,
													{
														color:
															n <= notaSelecionada
																? Colors.warning
																: Colors.border,
													},
												]}
											>
												★
											</Text>
										</TouchableOpacity>
									))}
								</View>

								<View style={styles.inputRow}>
									<TextInput
										placeholder="Escreva sua avaliação..."
										placeholderTextColor={Colors.textMuted}
										style={styles.input}
										value={comentario}
										onChangeText={setComentario}
										multiline
									/>
									<TouchableOpacity
										style={[
											styles.sendBtn,
											(!comentario.trim() || !notaSelecionada) && {
												opacity: 0.4,
											},
										]}
										onPress={enviarAvaliacao}
										disabled={enviando}
									>
										{enviando ? (
											<ActivityIndicator size="small" color="#fff" />
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
							<View style={styles.jaAvaliadoBox}>
								<Text style={styles.jaAvaliadoText}>
									✅ Você já avaliou este evento
								</Text>
							</View>
						)}

						{/* LISTA */}
						{loadingAval ? (
							<ActivityIndicator
								size="small"
								color={Colors.primary}
								style={{ marginTop: 16 }}
							/>
						) : avaliacoes.length === 0 ? (
							<Text style={styles.emptyAval}>
								Nenhuma avaliação ainda. Seja o primeiro!
							</Text>
						) : (
							<View style={styles.avalList}>
								{avaliacoes.map((item) => (
									<View key={item.id} style={styles.avalCard}>
										<Image
											source={{ uri: item.foto || "https://i.pravatar.cc/100" }}
											style={styles.avalAvatar}
										/>
										<View style={{ flex: 1 }}>
											<View style={styles.avalHeader2}>
												<View>
													<Text style={styles.avalNome}>{item.nome}</Text>
													<View style={styles.starsRowSmall}>
														{[1, 2, 3, 4, 5].map((n) => (
															<Text
																key={n}
																style={{
																	color:
																		n <= item.nota ? Colors.warning : Colors.border,
																	fontSize: 12,
																}}
															>
																★
															</Text>
														))}
													</View>
												</View>
												{item.userId === auth.currentUser?.uid && (
													<TouchableOpacity
														onPress={() => deletarAvaliacao(item.id)}
														style={styles.deleteBtn}
													>
														<MaterialCommunityIcons
															name="trash-can-outline"
															size={16}
															color={Colors.error}
														/>
													</TouchableOpacity>
												)}
											</View>
											<Text style={styles.avalTexto}>{item.comentario}</Text>
										</View>
									</View>
								))}
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.background },
	image: { width: "100%", height: 280 },
	overlay: { position: "absolute", bottom: 0, width: "100%", height: 140 },
	back: {
		position: "absolute",
		left: 16,
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 8,
		borderRadius: 10,
	},
	headerText: { position: "absolute", bottom: 20, left: 16, right: 16 },
	title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
	local: { color: "#ccc", fontSize: 13, marginTop: 2 },
	content: { padding: 16 },
	infoPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 6,
	},
	infoText: { color: Colors.textSecondary, fontSize: 13 },
	section: {
		color: Colors.textPrimary,
		fontSize: 16,
		fontWeight: "bold",
		marginTop: 14,
		marginBottom: 6,
	},
	description: { color: Colors.textSecondary, lineHeight: 20 },
	ocorrenciaBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: Colors.error,
		padding: 14,
		borderRadius: 14,
		marginTop: 20,
		justifyContent: "center",
	},
	ocorrenciaText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
	avalSection: { marginTop: 10 },
	avalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	media: { color: Colors.warning, fontSize: 16, fontWeight: "bold" },
	avalInputBox: {
		backgroundColor: Colors.surface,
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
		borderColor: Colors.border,
		marginBottom: 12,
	},
	starsRow: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 10,
		gap: 4,
	},
	star: { fontSize: 28 },
	inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
	input: {
		flex: 1,
		backgroundColor: Colors.background,
		color: Colors.textPrimary,
		borderRadius: 12,
		padding: 12,
		minHeight: 60,
		textAlignVertical: "top",
		borderWidth: 1,
		borderColor: Colors.border,
		fontSize: 13,
	},
	sendBtn: {
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	jaAvaliadoBox: {
		backgroundColor: Colors.surface,
		padding: 14,
		borderRadius: 14,
		alignItems: "center",
		marginBottom: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	jaAvaliadoText: { color: Colors.success, fontWeight: "bold" },
	emptyAval: { color: Colors.textMuted, textAlign: "center", marginTop: 12 },
	avalList: {
		marginTop: 12,
	},
	avalCard: {
		flexDirection: "row",
		gap: 10,
		backgroundColor: Colors.surface,
		borderRadius: 12,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	avalAvatar: { width: 40, height: 40, borderRadius: 20 },
	avalHeader2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	avalNome: { color: Colors.textPrimary, fontWeight: "600", fontSize: 13 },
	deleteBtn: {
		padding: 4,
	},
	starsRowSmall: {
		flexDirection: "row",
		marginVertical: 2,
		gap: 2,
	},
	avalTexto: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
	metricRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginTop: 8,
	},
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "rgba(255,255,255,0.18)",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 14,
	},
	viewRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "rgba(255,255,255,0.12)",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 14,
	},
	metricText: {
		color: "#fff",
		fontSize: 12,
	},
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
