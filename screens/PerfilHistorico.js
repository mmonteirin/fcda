import React, { useEffect, useState } from "react";
import {
	View,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	Alert,
	Platform,
} from "react-native";

import {
	collection,
	query,
	orderBy,
	onSnapshot,
	deleteDoc,
	doc,
	getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function PerfilHistorico({ navigation }) {
	const [tab, setTab] = useState("avaliacoes");

	const [avaliacoes, setAvaliacoes] = useState([]);
	const [ocorrencias, setOcorrencias] = useState([]);
	const [loadingAval, setLoadingAval] = useState(true);
	const [loadingOcorr, setLoadingOcorr] = useState(true);

	const userId = auth.currentUser?.uid;

	const confirmarAcao = (mensagem, callback) => {
		if (Platform.OS === "web") {
			const confirmado = window.confirm(mensagem);

			if (confirmado) {
				callback();
			}
		} else {
			Alert.alert("Confirmar", mensagem, [
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Confirmar",
					style: "destructive",
					onPress: callback,
				},
			]);
		}
	};

	const deletarAvaliacao = async (item) => {
		try {
			// remove do histórico
			await deleteDoc(doc(db, "users", userId, "avaliacoes", item.id));

			// remove da subcoleção do evento
			if (item.eventoId && item.avaliacaoId) {
				await deleteDoc(
					doc(db, "eventos", item.eventoId, "avaliacoes", item.avaliacaoId)
				);
			}
		} catch (e) {
			console.log(e);
			Alert.alert("Erro", "Não foi possível remover.");
		}
	};

	const deletarOcorrencia = async (item) => {
		try {
			// remove histórico
			await deleteDoc(doc(db, "users", userId, "ocorrencias", item.id));

			// remove ocorrência do evento
			if (item.eventoId && item.ocorrenciaId) {
				await deleteDoc(
					doc(db, "eventos", item.eventoId, "ocorrencias", item.ocorrenciaId)
				);
			}
		} catch (e) {
			console.log(e);
			Alert.alert("Erro", "Não foi possível remover.");
		}
	};

	const abrirEvento = async (eventoId) => {
		try {
			const eventoRef = doc(db, "eventos", eventoId);

			const snap = await getDoc(eventoRef);

			if (!snap.exists()) {
				Alert.alert("Erro", "Evento não encontrado.");
				return;
			}

			navigation.navigate("Detalhes", {
				evento: {
					id: snap.id,
					...snap.data(),
				},
			});
		} catch (e) {
			console.log(e);
			Alert.alert("Erro", "Não foi possível abrir o evento.");
		}
	};

	/* ⭐ AVALIAÇÕES — users/{uid}/avaliacoes */
	useEffect(() => {
		if (!userId) return;

		const q = query(
			collection(db, "users", userId, "avaliacoes"),
			orderBy("createdAt", "desc")
		);

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				setAvaliacoes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
				setLoadingAval(false);
			},
			(err) => {
				console.log("Erro avaliações:", err);
				setLoadingAval(false);
			}
		);

		return () => unsub();
	}, [userId]);

	/* 🚨 OCORRÊNCIAS — users/{uid}/ocorrencias */
	useEffect(() => {
		if (!userId) return;

		const q = query(
			collection(db, "users", userId, "ocorrencias"),
			orderBy("createdAt", "desc")
		);

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				setOcorrencias(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
				setLoadingOcorr(false);
			},
			(err) => {
				console.log("Erro ocorrências:", err);
				setLoadingOcorr(false);
			}
		);

		return () => unsub();
	}, [userId]);

	const isLoading = tab === "avaliacoes" ? loadingAval : loadingOcorr;
	const dados = tab === "avaliacoes" ? avaliacoes : ocorrencias;

	const renderItem = ({ item }) => (
		<TouchableOpacity
			activeOpacity={0.8}
			style={styles.card}
			onPress={() => abrirEvento(item.eventoId)}
		>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<View style={{ flex: 1 }}>
					<AppText style={styles.localText}>
						📍 {item.tituloEvento || item.local || "Evento"}
					</AppText>

					{/* AVALIAÇÃO */}
					{tab === "avaliacoes" && (
						<>
							<View style={styles.starsRow}>
								{[1, 2, 3, 4, 5].map((n) => (
									<AppText
										key={n}
										style={{
											color: n <= item.nota ? Colors.warning : Colors.border,
											fontSize: 14,
										}}
									>
										★
									</AppText>
								))}

								<AppText style={styles.notaText}> {item.nota}/5</AppText>
							</View>

							<AppText style={styles.cardText}>
								{item.comentario || "—"}
							</AppText>
						</>
					)}

					{/* OCORRÊNCIA */}
					{tab === "ocorrencias" && (
						<>
							{item.tipo ? (
								<View style={styles.tipoBadge}>
									<AppText style={styles.tipoText}>{item.tipo}</AppText>
								</View>
							) : null}

							<AppText style={styles.cardText}>{item.descricao || "—"}</AppText>
						</>
					)}

					{item.createdAt?.toDate && (
						<AppText style={styles.dataText}>
							{item.createdAt.toDate().toLocaleDateString("pt-BR")}
						</AppText>
					)}
				</View>

				<TouchableOpacity
					onPress={() =>
						confirmarAcao(
							tab === "avaliacoes"
								? "Deseja apagar esta avaliação?"
								: "Deseja apagar esta ocorrência?",
							() =>
								tab === "avaliacoes"
									? deletarAvaliacao(item)
									: deletarOcorrencia(item)
						)
					}
				>
					<MaterialCommunityIcons
						name="delete"
						size={20}
						color={Colors.error}
					/>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialCommunityIcons
						name="arrow-left"
						size={26}
						color={Colors.primary}
					/>
				</TouchableOpacity>
				<AppText style={styles.title}>Meu Histórico</AppText>
			</View>

			{/* TABS */}
			<View style={styles.tabsWrapper}>
				{["avaliacoes", "ocorrencias"].map((t) => (
					<TouchableOpacity
						key={t}
						onPress={() => setTab(t)}
						style={[styles.tab, tab === t && styles.activeTab]}
					>
						<AppText
							style={[styles.tabText, tab === t && styles.activeTabText]}
						>
							{t === "avaliacoes"
								? `⭐ Avaliações (${avaliacoes.length})`
								: `🚨 Ocorrências (${ocorrencias.length})`}
						</AppText>
					</TouchableOpacity>
				))}
			</View>

			{/* LISTA */}
			{isLoading ? (
				<View style={styles.loadingBox}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={dados}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.emptyBox}>
							<MaterialCommunityIcons
								name={
									tab === "avaliacoes" ? "star-outline" : "alert-circle-outline"
								}
								size={44}
								color={Colors.textMuted}
							/>
							<AppText style={styles.empty}>
								{tab === "avaliacoes"
									? "Nenhuma avaliação registrada"
									: "Nenhuma ocorrência registrada"}
							</AppText>
						</View>
					}
					renderItem={renderItem}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.background },
	header: {
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	title: { fontSize: 18, fontWeight: "bold", color: Colors.textPrimary },
	tabsWrapper: {
		flexDirection: "row",
		marginHorizontal: 16,
		backgroundColor: Colors.surface,
		borderRadius: 14,
		padding: 4,
		borderWidth: 1,
		borderColor: Colors.border,
		marginBottom: 4,
	},
	tab: { flex: 1, padding: 10, borderRadius: 10 },
	activeTab: { backgroundColor: Colors.primary },
	tabText: {
		textAlign: "center",
		color: Colors.textSecondary,
		fontWeight: "bold",
		fontSize: 12,
	},
	activeTabText: { color: "#fff" },
	list: { padding: 16 },
	loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
	emptyBox: { alignItems: "center", marginTop: 50, gap: 12 },
	empty: { color: Colors.textMuted, textAlign: "center", fontSize: 14 },
	card: {
		backgroundColor: Colors.surface,
		padding: 16,
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	localText: {
		color: Colors.primary,
		fontSize: 13,
		marginBottom: 6,
		fontWeight: "bold",
	},
	starsRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
	notaText: { color: Colors.textSecondary, fontSize: 12 },
	tipoBadge: {
		backgroundColor: Colors.card,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
		alignSelf: "flex-start",
		marginBottom: 8,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	tipoText: {
		color: Colors.textMuted,
		fontSize: 11,
		textTransform: "uppercase",
	},
	cardText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
	dataText: {
		color: Colors.textMuted,
		fontSize: 11,
		marginTop: 8,
		textAlign: "right",
	},
});
