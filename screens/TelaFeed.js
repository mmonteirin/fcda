import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	Alert,
	ActivityIndicator,
	Platform,
	Animated,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
	collection,
	query,
	where,
	onSnapshot,
	deleteDoc,
	doc,
	orderBy,
	updateDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";
import { getUserFeedLikes } from "../services/feedService";

export default function TelaFeed({ navigation }) {
	const { user, nome, foto, isAdmin } = useAuth();
	const [eventos, setEventos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [likedIds, setLikedIds] = useState([]);

	// 🔥 Carregar likes do usuário
	useEffect(() => {
		const carregarLikes = async () => {
			if (user?.uid) {
				const likes = await getUserFeedLikes(user.uid);
				setLikedIds(likes);
			}
		};
		carregarLikes();
	}, [user?.uid]);

	// 🔥 Filtra por uidEvento (campo real do banco)
	useEffect(() => {
		if (!user?.uid) return;

		let q;

		// ✅ ADMIN -> apenas eventos dele
		if (isAdmin) {
			q = query(
				collection(db, "eventos"),
				where("uidEvento", "==", user.uid),
				orderBy("createdAt", "desc")
			);
		}

		// ✅ USER -> todos os eventos
		else {
			q = query(collection(db, "eventos"), orderBy("createdAt", "desc"));
		}

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				const lista = snapshot.docs
					.map((d) => ({
						id: d.id,
						...d.data(),
					}))
					.filter((item) => item.id !== "_init");

				setEventos(lista);
				setLoading(false);
			},
			(err) => {
				console.log("Erro ao carregar eventos:", err);
				setLoading(false);
			}
		);

		return () => unsub();
	}, [user?.uid, isAdmin]);

	const toggleLike = async (eventoId) => {
		if (!user?.uid) return;

		try {
			const eventoRef = doc(db, "eventos", eventoId);
			const isLiked = likedIds.includes(eventoId);

			if (isLiked) {
				await updateDoc(eventoRef, {
					likes: Math.max(0, (eventos.find(e => e.id === eventoId)?.likes || 1) - 1),
				});
				setLikedIds(likedIds.filter(id => id !== eventoId));
			} else {
				await updateDoc(eventoRef, {
					likes: (eventos.find(e => e.id === eventoId)?.likes || 0) + 1,
				});
				setLikedIds([...likedIds, eventoId]);
			}
		} catch (error) {
			console.log("Erro ao fazer like:", error);
		}
	};

	const deletarEvento = async (id) => {
		try {
			let confirmado = false;

			// 🔥 WEB
			if (Platform.OS === "web") {
				confirmado = window.confirm("Deseja excluir este evento?");
			}

			// 🔥 MOBILE
			else {
				return Alert.alert("Excluir", "Deseja excluir este evento?", [
					{
						text: "Cancelar",
						style: "cancel",
					},
					{
						text: "Excluir",
						style: "destructive",
						onPress: async () => {
							try {
								await deleteDoc(doc(db, "eventos", id));
							} catch (error) {
								console.log(error);
								Alert.alert("Erro ao excluir");
							}
						},
					},
				]);
			}

			// 🔥 WEB DELETE
			if (confirmado) {
				await deleteDoc(doc(db, "eventos", id));
			}
		} catch (error) {
			console.log(error);

			if (Platform.OS === "web") {
				window.alert("Erro ao excluir");
			} else {
				Alert.alert("Erro ao excluir");
			}
		}
	};

	const formatarNumero = (num) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
		if (num >= 1000) return (num / 1000).toFixed(1) + "K";
		return num.toString();
	};

	const formatarData = (timestamp) => {
		if (!timestamp) return "Há pouco";
		const date = timestamp.toDate?.() || new Date(timestamp);
		const agora = new Date();
		const diff = agora - date;
		const minutos = Math.floor(diff / 60000);
		const horas = Math.floor(diff / 3600000);
		const dias = Math.floor(diff / 86400000);

		if (minutos < 1) return "Agora";
		if (minutos < 60) return `${minutos}m atrás`;
		if (horas < 24) return `${horas}h atrás`;
		if (dias < 7) return `${dias}d atrás`;

		return date.toLocaleDateString("pt-BR");
	};

	const CardInstagram = ({ item }) => {
		const isLiked = likedIds.includes(item.id);

		return (
			<View style={styles.instagramCard}>
				{/* 📸 HEADER - Info do Criador */}
				<View style={styles.cardHeader}>
					<View style={styles.creatorInfo}>
						<Image
							source={{
								uri: item.userPhoto || "https://via.placeholder.com/40",
							}}
							style={styles.creatorAvatar}
						/>
						<View style={{ flex: 1 }}>
							<Text style={styles.creatorName} numberOfLines={1}>
								{item.adminNome || "Organizador"}
							</Text>
							<Text style={styles.creatorDate}>
								{formatarData(item.createdAt)}
							</Text>
						</View>
					</View>

					{isAdmin && item.uidEvento === user?.uid && (
						<TouchableOpacity
							style={styles.menuBtn}
							onPress={() => deletarEvento(item.id)}
						>
							<MaterialCommunityIcons
								name="trash-can-outline"
								size={20}
								color={Colors.error}
							/>
						</TouchableOpacity>
					)}
				</View>

				{/* 🖼️ IMAGEM PRINCIPAL */}
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() =>
						navigation.navigate("Detalhes", { evento: item })
					}
				>
					<Image
						source={{
							uri:
								item.imagemEvento ||
								"https://placehold.co/400x400/1a0533/ffffff?text=Evento",
						}}
						style={styles.mainImage}
					/>
					
					{/* Overlay com info rápida */}
					<LinearGradient
						colors={["transparent", "rgba(0,0,0,0.8)"]}
						style={styles.imageOverlay}
					>
						<Text style={styles.eventTitle} numberOfLines={2}>
							{item.tituloEvento || "Sem título"}
						</Text>
						<Text style={styles.eventLocal} numberOfLines={1}>
							📍 {item.localEvento || item.nomeLocal || "Local"}
						</Text>
					</LinearGradient>
				</TouchableOpacity>

				{/* 🎯 BOTÕES DE INTERAÇÃO */}
				<View style={styles.actionButtons}>
					<TouchableOpacity
						style={styles.actionBtn}
						onPress={() => toggleLike(item.id)}
					>
						<MaterialCommunityIcons
							name={isLiked ? "heart" : "heart-outline"}
							size={24}
							color={isLiked ? Colors.error : Colors.textSecondary}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionBtn}
						onPress={() =>
							navigation.navigate("Detalhes", { evento: item })
						}
					>
						<MaterialCommunityIcons
							name="comment-outline"
							size={24}
							color={Colors.textSecondary}
						/>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionBtn}>
						<MaterialCommunityIcons
							name="share-outline"
							size={24}
							color={Colors.textSecondary}
						/>
					</TouchableOpacity>

					<View style={{ flex: 1 }} />

					<TouchableOpacity
						style={styles.actionBtn}
						onPress={() =>
							navigation.navigate("Detalhes", { evento: item })
						}
					>
						<MaterialCommunityIcons
							name="bookmark-outline"
							size={24}
							color={Colors.textSecondary}
						/>
					</TouchableOpacity>
				</View>

				{/* 📊 MÉTRICAS */}
				<View style={styles.metrics}>
					<Text style={styles.metricsText}>
						<Text style={styles.metricsBold}>
							{formatarNumero(item.likes || 0)}
						</Text>
						{" likes"}
					</Text>
					<Text style={styles.metricsText}>
						<Text style={styles.metricsBold}>
							{formatarNumero(item.views || 0)}
						</Text>
						{" visualizações"}
					</Text>
				</View>

				{/* 📝 DESCRIÇÃO */}
				{item.descricao && (
					<View style={styles.descriptionBox}>
						<Text style={styles.descriptionText} numberOfLines={3}>
							<Text style={styles.creatorName}>{item.adminNome}: </Text>
							{item.descricao}
						</Text>
					</View>
				)}

				{/* 📅 DATA E HORA */}
				<View style={styles.infoFooter}>
					<Text style={styles.infoFooterText}>
						📅 {item.dataEvento || "Data TBA"}
					</Text>
					{item.horaInicio && (
						<Text style={styles.infoFooterText}>
							🕐 {item.horaInicio}
							{item.horaFim ? ` às ${item.horaFim}` : ""}
						</Text>
					)}
				</View>

				{/* DIVIDER */}
				<View style={styles.divider} />
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: Colors.background }}>
			<LinearGradient
				colors={[Colors.background, Colors.surface]}
				style={styles.header}
			>
				<Text style={styles.headerTitle}>Feed</Text>
				<TouchableOpacity
					onPress={() => navigation.navigate("CriarPost")}
					style={styles.createBtn}
				>
					<MaterialCommunityIcons
						name="plus"
						size={26}
						color={Colors.primary}
					/>
				</TouchableOpacity>
			</LinearGradient>

			<FlatList
				data={eventos}
				renderItem={({ item }) => <CardInstagram item={item} />}
				keyExtractor={(item) => item.id}
				scrollEnabled={true}
				showsVerticalScrollIndicator={true}
				initialNumToRender={3}
				maxToRenderPerBatch={5}
				updateCellsBatchingPeriod={50}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<MaterialCommunityIcons
							name="inbox-outline"
							size={60}
							color={Colors.textSecondary}
						/>
						<Text style={styles.emptyStateText}>
							Nenhum evento ainda
						</Text>
					</View>
				}
			/>
		</View>
	);
}

const styles = {
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 12,
		backgroundColor: Colors.background,
	},
	headerTitle: {
		color: Colors.textPrimary,
		fontSize: 28,
		fontWeight: "bold",
	},
	createBtn: {
		padding: 8,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyStateText: {
		color: Colors.textSecondary,
		fontSize: 14,
		marginTop: 12,
		textAlign: "center",
	},

	/* 📸 CARD INSTAGRAM */
	instagramCard: {
		backgroundColor: Colors.surface,
		marginBottom: 12,
		borderBottomWidth: 0.5,
		borderBottomColor: Colors.border,
	},

	/* HEADER DO CARD */
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	creatorInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	creatorAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
		backgroundColor: Colors.border,
	},
	creatorName: {
		color: Colors.textPrimary,
		fontSize: 13,
		fontWeight: "600",
	},
	creatorDate: {
		color: Colors.textSecondary,
		fontSize: 12,
		marginTop: 2,
	},
	menuBtn: {
		padding: 8,
	},

	/* IMAGEM PRINCIPAL */
	mainImage: {
		width: "100%",
		height: 380,
		backgroundColor: Colors.border,
	},
	imageOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 120,
		justifyContent: "flex-end",
		paddingHorizontal: 12,
		paddingBottom: 12,
	},
	eventTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
	},
	eventLocal: {
		color: "#fff",
		fontSize: 12,
	},

	/* BOTÕES DE AÇÃO */
	actionButtons: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: Colors.surface,
	},
	actionBtn: {
		marginRight: 16,
		padding: 6,
	},

	/* MÉTRICAS */
	metrics: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: Colors.surface,
	},
	metricsText: {
		color: Colors.textSecondary,
		fontSize: 12,
		marginBottom: 4,
	},
	metricsBold: {
		color: Colors.textPrimary,
		fontWeight: "bold",
	},

	/* DESCRIÇÃO */
	descriptionBox: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: Colors.surface,
	},
	descriptionText: {
		color: Colors.textSecondary,
		fontSize: 12,
		lineHeight: 16,
	},

	/* INFO FOOTER */
	infoFooter: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: Colors.surface,
	},
	infoFooterText: {
		color: Colors.textSecondary,
		fontSize: 11,
		marginBottom: 4,
	},

	/* DIVIDER */
	divider: {
		height: 8,
		backgroundColor: Colors.background,
	},
};
