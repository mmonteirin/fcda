import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	Alert,
	ActivityIndicator,
	Platform,
	StyleSheet,
	StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	collection,
	query,
	where,
	deleteDoc,
	doc,
	orderBy,
	limit,
	startAfter,
	getDocs,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";
import { getUserFeedLikes, toggleEventoLike } from "../services/feedService";

const PAGE_SIZE = 10;

export default function TelaFeed({ navigation }) {
	const insets = useSafeAreaInsets();

	const { user, isAdmin } = useAuth();

	const [eventos, setEventos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [likedIds, setLikedIds] = useState([]);

	const lastDocRef = useRef(null);

	/* =========================
	 * ❤️ Likes
	 * ========================= */
	useEffect(() => {
		const carregarLikes = async () => {
			if (!user?.uid) return;

			try {
				const likes = await getUserFeedLikes(user.uid);
				setLikedIds(likes);
			} catch (e) {
				console.log(e);
			}
		};

		carregarLikes();
	}, [user?.uid]);

	/* =========================
	 * 📦 Feed
	 * ========================= */
	useEffect(() => {
		if (!user?.uid) return;

		setEventos([]);
		lastDocRef.current = null;
		setHasMore(true);

		carregarPagina(true);
	}, [user?.uid, isAdmin]);

	const carregarPagina = async (isFirst = false) => {
		if (!user?.uid) return;

		isFirst ? setLoading(true) : setLoadingMore(true);

		try {
			let q;

			if (isAdmin) {
				q =
					isFirst || !lastDocRef.current
						? query(
								collection(db, "eventos"),
								where("uidEvento", "==", user.uid),
								orderBy("createdAt", "desc"),
								limit(PAGE_SIZE)
						  )
						: query(
								collection(db, "eventos"),
								where("uidEvento", "==", user.uid),
								orderBy("createdAt", "desc"),
								startAfter(lastDocRef.current),
								limit(PAGE_SIZE)
						  );
			} else {
				q =
					isFirst || !lastDocRef.current
						? query(
								collection(db, "eventos"),
								orderBy("createdAt", "desc"),
								limit(PAGE_SIZE)
						  )
						: query(
								collection(db, "eventos"),
								orderBy("createdAt", "desc"),
								startAfter(lastDocRef.current),
								limit(PAGE_SIZE)
						  );
			}

			const snapshot = await getDocs(q);

			const novos = snapshot.docs
				.map((d) => ({
					id: d.id,
					...d.data(),
				}))
				.filter((item) => item.id !== "_init");

			if (snapshot.docs.length > 0) {
				lastDocRef.current =
					snapshot.docs[snapshot.docs.length - 1];
			}

			if (snapshot.docs.length < PAGE_SIZE) {
				setHasMore(false);
			}

			setEventos((prev) =>
				isFirst ? novos : [...prev, ...novos]
			);
		} catch (e) {
			console.log("Erro ao carregar feed:", e);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleEndReached = () => {
		if (!loadingMore && hasMore) {
			carregarPagina(false);
		}
	};

	/* =========================
	 * ❤️ Like
	 * ========================= */
	const toggleLike = async (eventoId) => {
		if (!user?.uid) return;

		try {
			const liked = await toggleEventoLike(
				eventoId,
				user.uid
			);

			if (liked) {
				setLikedIds((prev) => [...prev, eventoId]);
			} else {
				setLikedIds((prev) =>
					prev.filter((id) => id !== eventoId)
				);
			}
		} catch (e) {
			console.log(e);
		}
	};

	/* =========================
	 * 🗑️ Excluir
	 * ========================= */
	const deletarEvento = async (id) => {
		try {
			if (Platform.OS === "web") {
				const confirmado = window.confirm(
					"Deseja excluir este evento?"
				);

				if (!confirmado) return;

				await deleteDoc(doc(db, "eventos", id));

				setEventos((prev) =>
					prev.filter((e) => e.id !== id)
				);

				return;
			}

			Alert.alert(
				"Excluir evento",
				"Tem certeza que deseja excluir?",
				[
					{
						text: "Cancelar",
						style: "cancel",
					},
					{
						text: "Excluir",
						style: "destructive",
						onPress: async () => {
							try {
								await deleteDoc(
									doc(db, "eventos", id)
								);

								setEventos((prev) =>
									prev.filter(
										(e) => e.id !== id
									)
								);
							} catch (e) {
								console.log(e);
								Alert.alert(
									"Erro",
									"Não foi possível excluir."
								);
							}
						},
					},
				]
			);
		} catch (e) {
			console.log(e);
		}
	};

	/* =========================
	 * 📅 Helpers
	 * ========================= */
	const formatarNumero = (num) => {
		if (!num) return "0";

		if (num >= 1000000)
			return (num / 1000000).toFixed(1) + "M";

		if (num >= 1000)
			return (num / 1000).toFixed(1) + "K";

		return num.toString();
	};

	const formatarData = (timestamp) => {
		if (!timestamp) return "Agora";

		const data = timestamp.toDate?.() || new Date(timestamp);

		const agora = new Date();

		const diff = agora - data;

		const minutos = Math.floor(diff / 60000);
		const horas = Math.floor(diff / 3600000);
		const dias = Math.floor(diff / 86400000);

		if (minutos < 1) return "Agora";
		if (minutos < 60) return `${minutos}m`;
		if (horas < 24) return `${horas}h`;
		if (dias < 7) return `${dias}d`;

		return data.toLocaleDateString("pt-BR");
	};

	/* =========================
	 * 📸 CARD
	 * ========================= */
	const renderItem = ({ item }) => {
		const isLiked = likedIds.includes(item.id);

		return (
			<View style={styles.card}>
				{/* HEADER */}
				<View style={styles.cardHeader}>
					<View style={styles.userInfo}>
						<Image
							source={{
								uri:
									item.userPhoto ||
									"https://i.pravatar.cc/150",
							}}
							style={styles.avatar}
						/>

						<View style={{ flex: 1 }}>
							<Text
								numberOfLines={1}
								style={styles.userName}
							>
								{item.adminNome || "Organizador"}
							</Text>

							<View style={styles.locationRow}>
								<MaterialCommunityIcons
									name="map-marker"
									size={12}
									color={Colors.textMuted}
								/>

								<Text
									numberOfLines={1}
									style={styles.locationText}
								>
									{item.localEvento ||
										item.nomeLocal ||
										"Local"}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.headerActions}>
						<Text style={styles.dateText}>
							{formatarData(item.createdAt)}
						</Text>

						{isAdmin &&
							item.uidEvento === user?.uid && (
								<TouchableOpacity
									style={styles.deleteBtn}
									onPress={() =>
										deletarEvento(item.id)
									}
								>
									<MaterialCommunityIcons
										name="trash-can-outline"
										size={20}
										color={Colors.error}
									/>
								</TouchableOpacity>
							)}
					</View>
				</View>

				{/* IMAGE */}
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() =>
						navigation.navigate("Detalhes", {
							evento: item,
						})
					}
					style={styles.imageWrapper}
				>
					<Image
						source={{
							uri:
								item.imagemEvento ||
								"https://placehold.co/600x600",
						}}
						style={styles.mainImage}
					/>

					<LinearGradient
						colors={[
							"transparent",
							"rgba(0,0,0,0.88)",
						]}
						style={styles.overlay}
					>
						<View style={styles.badge}>
							<MaterialCommunityIcons
								name="calendar"
								size={13}
								color="#fff"
							/>

							<Text style={styles.badgeText}>
								{item.dataEvento || "Evento"}
							</Text>
						</View>

						<Text
							numberOfLines={2}
							style={styles.eventTitle}
						>
							{item.tituloEvento ||
								"Evento sem título"}
						</Text>

						{item.horaInicio && (
							<Text style={styles.eventTime}>
								🕐 {item.horaInicio}
								{item.horaFim
									? ` às ${item.horaFim}`
									: ""}
							</Text>
						)}
					</LinearGradient>
				</TouchableOpacity>

				{/* ACTIONS */}
				<View style={styles.actions}>
					<View style={styles.leftActions}>
						<TouchableOpacity
							style={styles.actionBtn}
							onPress={() =>
								toggleLike(item.id)
							}
						>
							<MaterialCommunityIcons
								name={
									isLiked
										? "heart"
										: "heart-outline"
								}
								size={25}
								color={
									isLiked
										? Colors.error
										: Colors.textPrimary
								}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionBtn}
							onPress={() =>
								navigation.navigate(
									"Detalhes",
									{
										evento: item,
									}
								)
							}
						>
							<MaterialCommunityIcons
								name="comment-outline"
								size={24}
								color={
									Colors.textPrimary
								}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionBtn}
						>
							<MaterialCommunityIcons
								name="share-variant-outline"
								size={23}
								color={
									Colors.textPrimary
								}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={styles.actionBtn}
					>
						<MaterialCommunityIcons
							name="bookmark-outline"
							size={24}
							color={Colors.textPrimary}
						/>
					</TouchableOpacity>
				</View>

				{/* METRICS */}
				<View style={styles.metricsContainer}>
					<Text style={styles.likesText}>
						{formatarNumero(item.likes || 0)} curtidas
					</Text>

					<Text style={styles.viewsText}>
						{formatarNumero(
							item.views || 0
						)}{" "}
						visualizações
					</Text>
				</View>

				{/* DESCRIPTION */}
				{!!item.descricao && (
					<View style={styles.descriptionContainer}>
						<Text
							numberOfLines={3}
							style={styles.description}
						>
							<Text style={styles.descriptionUser}>
								{item.adminNome || "Organizador"}{" "}
							</Text>

							{item.descricao}
						</Text>
					</View>
				)}
			</View>
		);
	};

	/* =========================
	 * ⏳ Loading
	 * ========================= */
	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size="large"
					color={Colors.primary}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={Colors.background}
			/>

			{/* HEADER */}
			<LinearGradient
				colors={[Colors.background, Colors.surface]}
				style={[
					styles.header,
					{
						paddingTop: insets.top + 8,
					},
				]}
			>
				<View>
					<Text style={styles.feedTitle}>Explorar</Text>
					<Text style={styles.feedSubtitle}>
						Eventos acontecendo agora
					</Text>
				</View>

				<TouchableOpacity
					style={styles.createButton}
					onPress={() =>
						navigation.navigate("CriarPost")
					}
				>
					<MaterialCommunityIcons
						name="plus"
						size={24}
						color="#fff"
					/>
				</TouchableOpacity>
			</LinearGradient>

			{/* FEED */}
			<FlatList
				data={eventos}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingBottom: 40,
				}}
				initialNumToRender={4}
				maxToRenderPerBatch={5}
				windowSize={7}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.3}
				ListFooterComponent={
					loadingMore ? (
						<View style={styles.footerLoader}>
							<ActivityIndicator
								color={Colors.primary}
							/>
						</View>
					) : null
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<MaterialCommunityIcons
							name="calendar-blank-outline"
							size={70}
							color={Colors.textMuted}
						/>

						<Text style={styles.emptyTitle}>
							Nenhum evento encontrado
						</Text>

						<Text style={styles.emptySubtitle}>
							Novos eventos aparecerão aqui
						</Text>
					</View>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},

	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},

	/* HEADER */
	header: {
		paddingHorizontal: 18,
		paddingBottom: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},

	feedTitle: {
		color: Colors.textPrimary,
		fontSize: 30,
		fontWeight: "800",
	},

	feedSubtitle: {
		color: Colors.textMuted,
		fontSize: 13,
		marginTop: 2,
	},

	createButton: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: Colors.primary,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
	},

	/* CARD */
	card: {
		backgroundColor: Colors.surface,
		marginHorizontal: 14,
		marginBottom: 20,
		borderRadius: 24,
		overflow: "hidden",

		borderWidth: 1,
		borderColor: Colors.border,

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 10,

		elevation: 5,
	},

	/* HEADER CARD */
	cardHeader: {
		paddingHorizontal: 14,
		paddingVertical: 14,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},

	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
		backgroundColor: Colors.border,
	},

	userName: {
		color: Colors.textPrimary,
		fontSize: 14,
		fontWeight: "700",
	},

	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
	},

	locationText: {
		color: Colors.textMuted,
		fontSize: 12,
		marginLeft: 3,
		flex: 1,
	},

	headerActions: {
		alignItems: "flex-end",
	},

	dateText: {
		color: Colors.textMuted,
		fontSize: 11,
	},

	deleteBtn: {
		marginTop: 6,
		padding: 4,
	},

	/* IMAGE */
	imageWrapper: {
		position: "relative",
	},

	mainImage: {
		width: "100%",
		height: 420,
		backgroundColor: Colors.border,
	},

	overlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 16,
		paddingBottom: 16,
		paddingTop: 40,
	},

	badge: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.18)",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 50,
		marginBottom: 10,
	},

	badgeText: {
		color: "#fff",
		fontSize: 11,
		fontWeight: "600",
		marginLeft: 5,
	},

	eventTitle: {
		color: "#fff",
		fontSize: 22,
		fontWeight: "800",
		lineHeight: 28,
	},

	eventTime: {
		color: "#fff",
		fontSize: 13,
		marginTop: 6,
	},

	/* ACTIONS */
	actions: {
		paddingHorizontal: 10,
		paddingTop: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},

	leftActions: {
		flexDirection: "row",
		alignItems: "center",
	},

	actionBtn: {
		padding: 8,
	},

	/* METRICS */
	metricsContainer: {
		paddingHorizontal: 16,
		paddingTop: 4,
	},

	likesText: {
		color: Colors.textPrimary,
		fontWeight: "700",
		fontSize: 13,
	},

	viewsText: {
		color: Colors.textMuted,
		fontSize: 12,
		marginTop: 3,
	},

	/* DESCRIPTION */
	descriptionContainer: {
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 18,
	},

	description: {
		color: Colors.textSecondary,
		fontSize: 13,
		lineHeight: 20,
	},

	descriptionUser: {
		color: Colors.textPrimary,
		fontWeight: "700",
	},

	/* EMPTY */
	emptyState: {
		alignItems: "center",
		paddingTop: 100,
		paddingHorizontal: 30,
	},

	emptyTitle: {
		color: Colors.textPrimary,
		fontSize: 18,
		fontWeight: "700",
		marginTop: 18,
	},

	emptySubtitle: {
		color: Colors.textMuted,
		fontSize: 13,
		marginTop: 6,
		textAlign: "center",
	},

	footerLoader: {
		paddingVertical: 30,
		alignItems: "center",
	},
});