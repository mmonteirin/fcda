import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	Alert,
	ActivityIndicator,
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
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

export default function AdmEvento({ navigation }) {
	const { user, nome, foto } = useAuth();
	const [eventos, setEventos] = useState([]);
	const [loading, setLoading] = useState(true);

	// 🔥 Filtra por uidEvento (campo real do banco)
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, "eventos"),
			where("uidEvento", "==", user.uid), // campo real: uidEvento
			orderBy("createdAt", "desc")
		);

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
				setEventos(lista);
				setLoading(false);
			},
			(err) => {
				console.log("Erro ao carregar eventos:", err);
				setLoading(false);
			}
		);

		return () => unsub();
	}, [user?.uid]);

	const deletarEvento = (id) => {
		Alert.alert("Excluir", "Deseja excluir este evento?", [
			{ text: "Cancelar", style: "cancel" },
			{
				text: "Excluir",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteDoc(doc(db, "eventos", id));
					} catch {
						Alert.alert("Erro ao excluir");
					}
				},
			},
		]);
	};

	const renderItem = ({ item }) => (
		<View style={styles.card}>
			<Image
				source={{
					uri:
						item.imagemEvento ||
						"https://placehold.co/400x200/1a0533/ffffff?text=Evento",
				}}
				style={styles.image}
			/>
			<View style={{ padding: 14 }}>
				{/* tituloEvento */}
				<Text style={styles.titulo}>{item.tituloEvento || "Sem título"}</Text>

				{/* localEvento */}
				<Text style={styles.local}>
					📍 {item.localEvento || item.nomeLocal || "Local não informado"}
				</Text>

				{/* dataEvento */}
				<Text style={styles.data}>
					📅 {item.dataEvento || "Data não informada"}
				</Text>

				<View style={styles.actions}>
					<TouchableOpacity onPress={() => deletarEvento(item.id)}>
						<MaterialCommunityIcons
							name="delete-outline"
							size={22}
							color={Colors.error}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.dashboardBtn}
						onPress={() =>
							navigation.navigate("Metricas", { eventoId: item.id })
						}
					>
						<Text style={styles.dashboardText}>Dashboard</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

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
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={{ marginBottom: 10 }}
				>
					<MaterialCommunityIcons
						name="arrow-left"
						size={24}
						color={Colors.textPrimary}
					/>
				</TouchableOpacity>

				<View style={styles.headerContent}>
					<Image
						source={{ uri: foto || "https://i.pravatar.cc/100" }}
						style={styles.avatar}
					/>
					<View>
						<Text style={styles.nome}>{nome || "Usuário"}</Text>
						<Text style={styles.sub}>Organizador</Text>
					</View>
				</View>

				<Text style={styles.title}>Meus Eventos</Text>
			</LinearGradient>

			<FlatList
				data={eventos}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
				ListEmptyComponent={
					<Text style={styles.empty}>Nenhum evento cadastrado 😢</Text>
				}
			/>

			{/* FAB */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => navigation.navigate("CriarEvento")}
			>
				<MaterialCommunityIcons name="plus" size={26} color="#fff" />
			</TouchableOpacity>
		</View>
	);
}

const styles = {
	header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
	},
	avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
	nome: { color: Colors.textPrimary, fontSize: 16, fontWeight: "bold" },
	sub: { color: Colors.textSecondary, fontSize: 12 },
	title: { color: Colors.textPrimary, fontSize: 20, fontWeight: "bold" },
	card: {
		backgroundColor: Colors.card,
		borderRadius: 16,
		marginBottom: 16,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: Colors.border,
	},
	image: { width: "100%", height: 160 },
	titulo: { color: Colors.textPrimary, fontSize: 15, fontWeight: "bold" },
	local: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
	data: { color: Colors.primary, fontSize: 12, marginTop: 4 },
	actions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 12,
		alignItems: "center",
	},
	dashboardBtn: {
		backgroundColor: Colors.primary,
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 10,
	},
	dashboardText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
	fab: {
		position: "absolute",
		bottom: 25,
		right: 20,
		backgroundColor: Colors.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
	},
	empty: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
};
