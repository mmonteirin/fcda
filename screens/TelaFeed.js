import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	memo,
} from "react";
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
	Animated,
	Dimensions,
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
import {
	getUserFeedLikes,
	toggleEventoLike,
} from "../services/feedService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_SIZE = 10;
const MAX_CACHED_EVENTOS = 100;

/* ─── Like animado ─── */
const LikeButton = memo(({ isLiked, onPress }) => {
	const scale = useRef(new Animated.Value(1)).current;

	const handlePress = () => {
		Animated.sequence([
			Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 50 }),
			Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
		]).start();
		onPress();
	};

	return (
		<TouchableOpacity style={styles.actionBtn} onPress={handlePress} activeOpacity={0.7}>
			<Animated.View style={{ transform: [{ scale }] }}>
				<MaterialCommunityIcons
					name={isLiked ? "heart" : "heart-outline"}
					size={27}
					color={isLiked ? Colors.error : Colors.textPrimary}
				/>
			</Animated.View>
		</TouchableOpacity>
	);
});

/* ─── Card de Evento ─── */
const EventoCard = memo(
	({ item, isLiked, isAdmin, currentUserId, formatarNumero, formatarData, onToggleLike, onDelete, onNavigate, onComprarIngresso }) => {
		const [descExpanded, setDescExpanded] = useState(false);

		return (
			<View style={styles.card}>
				{/* HEADER */}
				<View style={styles.cardHeader}>
					<View style={styles.userInfo}>
						<Image
							source={{ uri: item.userPhoto || "https://i.pravatar.cc/150?u=" + item.id }}
							style={styles.avatar}
						/>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} style={styles.userName}>
								{item.adminNome || "Organizador"}
							</Text>
							<View style={styles.locationRow}>
								<MaterialCommunityIcons name="map-marker" size={12} color={Colors.primary} />
								<Text numberOfLines={1} style={styles.locationText}>
									{item.localEvento || item.nomeLocal || "Local não informado"}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.headerActions}>
						<View style={styles.dateBadge}>
							<Text style={styles.dateText}>{formatarData(item.createdAt)}</Text>
						</View>
						{isAdmin && item.uidEvento === currentUserId && (
							<TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
								<MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* IMAGEM */}
				<TouchableOpacity activeOpacity={0.92} onPress={() => onNavigate(item)} style={styles.imageWrapper}>
					<Image
						source={{ uri: item.imagemEvento || "https://placehold.co/600x600/1B1D26/6C5CE7?text=Evento" }}
						style={styles.mainImage}
						resizeMode="cover"
					/>
					<LinearGradient
						colors={["transparent", "rgba(0,0,0,0.85)"]}
						style={styles.imageOverlay}
					>
						{item.dataEvento && (
							<View style={styles.eventDateBadge}>
								<MaterialCommunityIcons name="calendar" size={12} color="#fff" />
								<Text style={styles.eventDateText}>
									{item.dataEvento}{item.horaInicio ? ` · ${item.horaInicio}` : ""}
								</Text>
							</View>
						)}
						<Text numberOfLines={2} style={styles.eventTitle}>
							{item.tituloEvento || "Evento sem título"}
						</Text>
						{item.precoInteira !== undefined && (
							<TouchableOpacity
								style={styles.ticketBadge}
								onPress={() => onComprarIngresso(item)}
								activeOpacity={0.85}
							>
								<MaterialCommunityIcons name="ticket" size={13} color={Colors.primary} />
								<Text style={styles.ticketBadgeText}>
									{item.precoInteira === 0 ? "Gratuito" : `R$ ${Number(item.precoInteira).toFixed(2)}`}
								</Text>
							</TouchableOpacity>
						)}
					</LinearGradient>
				</TouchableOpacity>

				{/* AÇÕES */}
				<View style={styles.actions}>
					<View style={styles.leftActions}>
						<LikeButton isLiked={isLiked} onPress={() => onToggleLike(item.id)} />
						<TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate(item)}>
							<MaterialCommunityIcons name="comment-outline" size={25} color={Colors.textPrimary} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionBtn}>
							<MaterialCommunityIcons name="share-variant-outline" size={24} color={Colors.textPrimary} />
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						style={styles.ingressoBtn}
						onPress={() => onComprarIngresso(item)}
						activeOpacity={0.85}
					>
						<MaterialCommunityIcons name="ticket-confirmation-outline" size={16} color="#fff" />
						<Text style={styles.ingressoBtnText}>Ingressos</Text>
					</TouchableOpacity>
				</View>

				{/* MÉTRICAS */}
				<View style={styles.metricsContainer}>
					<Text style={styles.likesText}>
						{formatarNumero(item.likes || 0)} curtida{(item.likes || 0) !== 1 ? "s" : ""}
					</Text>
					{(item.views || 0) > 0 && (
						<Text style={styles.viewsText}>
							{formatarNumero(item.views || 0)} visualizaç{(item.views || 0) === 1 ? "ão" : "ões"}
						</Text>
					)}
				</View>

				{/* DESCRIÇÃO */}
				{!!item.descricao && (
					<TouchableOpacity
						style={styles.descriptionContainer}
						activeOpacity={0.7}
						onPress={() => setDescExpanded((p) => !p)}
					>
						<Text numberOfLines={descExpanded ? undefined : 2} style={styles.description}>
							<Text style={styles.descriptionUser}>{item.adminNome || "Organizador"} </Text>
							{item.descricao}
						</Text>
						{!descExpanded && item.descricao.length > 80 && (
							<Text style={styles.verMais}>ver mais</Text>
						)}
					</TouchableOpacity>
				)}
			</View>
		);
	},
	(prev, next) => prev.item.id === next.item.id && prev.isLiked === next.isLiked
);

/* ─── TELA PRINCIPAL ─── */
export default function TelaFeed({ navigation }) {
	const insets = useSafeAreaInsets();
	const { user, isAdmin } = useAuth();

	const [eventos, setEventos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [likedIds, setLikedIds] = useState([]);

	const lastDocRef = useRef(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
			setEventos([]);
			setLikedIds([]);
			lastDocRef.current = null;
		};
	}, []);

	useEffect(() => {
		const carregarLikes = async () => {
			if (!user?.uid) return;
			try {
				const likes = await getUserFeedLikes(user.uid);
				if (isMountedRef.current) setLikedIds(likes);
			} catch (e) { console.log(e); }
		};
		carregarLikes();
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;
		setEventos([]);
		lastDocRef.current = null;
		setHasMore(true);
		carregarPagina(true);
	}, [user?.uid, isAdmin]);

	const carregarPagina = async (isFirst = false) => {
		if (!user?.uid || !isMountedRef.current) return;
		isFirst ? setLoading(true) : setLoadingMore(true);

		try {
			const base = collection(db, "eventos");
			const ord = orderBy("createdAt", "desc");
			let q;

			if (isAdmin) {
				const filtro = where("uidEvento", "==", user.uid);
				q = isFirst || !lastDocRef.current
					? query(base, filtro, ord, limit(PAGE_SIZE))
					: query(base, filtro, ord, startAfter(lastDocRef.current), limit(PAGE_SIZE));
			} else {
				q = isFirst || !lastDocRef.current
					? query(base, ord, limit(PAGE_SIZE))
					: query(base, ord, startAfter(lastDocRef.current), limit(PAGE_SIZE));
			}

			const snapshot = await getDocs(q);
			const novos = snapshot.docs
				.map((d) => ({ id: d.id, ...d.data() }))
				.filter((item) => item.id !== "_init");

			if (snapshot.docs.length > 0)
				lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
			if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);

			setEventos((prev) => {
				const combined = isFirst ? novos : [...prev, ...novos];
				return combined.slice(-MAX_CACHED_EVENTOS);
			});
		} catch (e) {
			console.log("Erro ao carregar feed:", e);
		} finally {
			if (isMountedRef.current) {
				setLoading(false);
				setLoadingMore(false);
			}
		}
	};

	const handleEndReached = useCallback(() => {
		if (!loadingMore && hasMore) carregarPagina(false);
	}, [loadingMore, hasMore]);

	const toggleLike = useCallback(async (eventoId) => {
		if (!user?.uid) return;
		try {
			const liked = await toggleEventoLike(eventoId, user.uid);
			if (liked) setLikedIds((prev) => [...prev, eventoId]);
			else setLikedIds((prev) => prev.filter((id) => id !== eventoId));
		} catch (e) { console.log(e); }
	}, [user?.uid]);

	const deletarEvento = useCallback(async (id) => {
		try {
			if (Platform.OS === "web") {
				if (!window.confirm("Deseja excluir este evento?")) return;
				await deleteDoc(doc(db, "eventos", id));
				setEventos((prev) => prev.filter((e) => e.id !== id));
				return;
			}
			Alert.alert("Excluir evento", "Tem certeza que deseja excluir?", [
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Excluir", style: "destructive",
					onPress: async () => {
						try {
							await deleteDoc(doc(db, "eventos", id));
							setEventos((prev) => prev.filter((e) => e.id !== id));
						} catch (e) { Alert.alert("Erro", "Não foi possível excluir."); }
					},
				},
			]);
		} catch (e) { console.log(e); }
	}, []);

	const formatarNumero = useCallback((num) => {
		if (!num) return "0";
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
		if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
		return num.toString();
	}, []);

	const formatarData = useCallback((timestamp) => {
		if (!timestamp) return "Agora";
		const data = timestamp.toDate?.() || new Date(timestamp);
		const diff = Date.now() - data.getTime();
		const min = Math.floor(diff / 60000);
		const h = Math.floor(diff / 3600000);
		const d = Math.floor(diff / 86400000);
		if (min < 1) return "Agora";
		if (min < 60) return `${min}m`;
		if (h < 24) return `${h}h`;
		if (d < 7) return `${d}d`;
		return data.toLocaleDateString("pt-BR");
	}, []);

	const handleComprarIngresso = useCallback((evento) => {
		navigation.navigate("TelaIngressos", { evento });
	}, [navigation]);

	const renderItem = useCallback(({ item }) => (
		<EventoCard
			item={item}
			isLiked={likedIds.includes(item.id)}
			isAdmin={isAdmin}
			currentUserId={user?.uid}
			formatarNumero={formatarNumero}
			formatarData={formatarData}
			onToggleLike={toggleLike}
			onDelete={deletarEvento}
			onNavigate={(evento) => navigation.navigate("Detalhes", { evento })}
			onComprarIngresso={handleComprarIngresso}
		/>
	), [likedIds, isAdmin, user?.uid, formatarNumero, formatarData, toggleLike, deletarEvento, navigation, handleComprarIngresso]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor={Colors.background} />

			{/* HEADER INSTAGRAM */}
			<View style={[styles.header, { paddingTop: insets.top + 6 }]}>
				<View style={styles.headerLeft}>
					<Text style={styles.logo}>MonitoraCult</Text>
					<View style={styles.logoAccent} />
				</View>
				<View style={styles.headerRight}>
					<TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate("CriarPost")}>
						<MaterialCommunityIcons name="plus-box-outline" size={26} color={Colors.textPrimary} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerIconBtn}>
						<MaterialCommunityIcons name="bell-outline" size={25} color={Colors.textPrimary} />
					</TouchableOpacity>
				</View>
			</View>

			{/* STORIES */}
			<View style={styles.storiesBar}>
				<TouchableOpacity style={styles.storyItem}>
					<LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.storyAddGradient}>
						<MaterialCommunityIcons name="plus" size={22} color="#fff" />
					</LinearGradient>
					<Text style={styles.storyLabel}>Seu story</Text>
				</TouchableOpacity>

				{["🎭", "🎵", "🎨", "🎪", "🎬"].map((emoji, i) => (
					<TouchableOpacity key={i} style={styles.storyItem}>
						<LinearGradient colors={["#6C5CE7", "#A855F7"]} style={styles.storyRing}>
							<View style={styles.storyAvatar}>
								<Text style={{ fontSize: 22 }}>{emoji}</Text>
							</View>
						</LinearGradient>
						<Text style={styles.storyLabel}>Cultura</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* FEED */}
			<FlatList
				data={eventos}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				initialNumToRender={4}
				maxToRenderPerBatch={5}
				windowSize={7}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.3}
				ListFooterComponent={
					loadingMore ? (
						<View style={styles.footerLoader}>
							<ActivityIndicator color={Colors.primary} />
						</View>
					) : null
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<MaterialCommunityIcons name="calendar-blank-outline" size={70} color={Colors.textMuted} />
						<Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
						<Text style={styles.emptySubtitle}>Novos eventos aparecerão aqui</Text>
						<TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("CriarPost")}>
							<Text style={styles.emptyBtnText}>Criar primeiro evento</Text>
						</TouchableOpacity>
					</View>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.background },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },

	header: {
		paddingHorizontal: 16,
		paddingBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: Colors.border,
		backgroundColor: Colors.background,
	},
	headerLeft: { position: "relative" },
	logo: { color: Colors.textPrimary, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
	logoAccent: { position: "absolute", bottom: -2, left: 0, width: 28, height: 3, borderRadius: 2, backgroundColor: Colors.primary },
	headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
	headerIconBtn: { padding: 8 },

	storiesBar: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border,
		backgroundColor: Colors.background,
		gap: 16,
	},
	storyItem: { alignItems: "center", gap: 5 },
	storyAddGradient: { width: 62, height: 62, borderRadius: 31, justifyContent: "center", alignItems: "center" },
	storyRing: { width: 66, height: 66, borderRadius: 33, justifyContent: "center", alignItems: "center" },
	storyAvatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center" },
	storyLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: "500" },

	card: { backgroundColor: Colors.surface, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: Colors.border },
	cardHeader: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
	avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10, backgroundColor: Colors.border, borderWidth: 2, borderColor: Colors.primary },
	userName: { color: Colors.textPrimary, fontSize: 14, fontWeight: "700" },
	locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 3 },
	locationText: { color: Colors.textMuted, fontSize: 12, flex: 1 },
	headerActions: { alignItems: "flex-end", gap: 6 },
	dateBadge: { backgroundColor: Colors.glass, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
	dateText: { color: Colors.textMuted, fontSize: 11, fontWeight: "500" },
	deleteBtn: { padding: 4 },

	imageWrapper: { position: "relative" },
	mainImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: Colors.border },
	imageOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 60 },
	eventDateBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(108,92,231,0.75)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 8, gap: 5 },
	eventDateText: { color: "#fff", fontSize: 11, fontWeight: "700" },
	eventTitle: { color: "#fff", fontSize: 20, fontWeight: "800", lineHeight: 26 },
	ticketBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 8, gap: 5 },
	ticketBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: "800" },

	actions: { paddingHorizontal: 6, paddingTop: 8, paddingBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	leftActions: { flexDirection: "row", alignItems: "center" },
	actionBtn: { padding: 8 },
	ingressoBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 6 },
	ingressoBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

	metricsContainer: { paddingHorizontal: 14, paddingBottom: 6 },
	likesText: { color: Colors.textPrimary, fontWeight: "700", fontSize: 13 },
	viewsText: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

	descriptionContainer: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },
	description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
	descriptionUser: { color: Colors.textPrimary, fontWeight: "700" },
	verMais: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },

	emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
	emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 18 },
	emptySubtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 6, textAlign: "center" },
	emptyBtn: { marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
	emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

	footerLoader: { paddingVertical: 30, alignItems: "center" },
});
