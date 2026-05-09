import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
} from "react-native";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../components/AppText";

import { Colors } from "../styles/Colors";

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
		const palavraEscapada = palavra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		// pega apenas palavra isolada
		const regex = new RegExp(`\\b${palavraEscapada}\\b`, "gi");

		textoLimpo = textoLimpo.replace(regex, "*".repeat(palavra.length));
	});

	return textoLimpo;
};

export default function PerfilDeclararOcorrencia({ navigation, route }) {
	const { eventoId, nomeEvento } = route.params;
	const insets = useSafeAreaInsets();

	const [descricao, setDescricao] = useState("");
	const [tipoSelecionado, setTipoSelecionado] = useState(null);
	const [loading, setLoading] = useState(false);

	const tipos = [
		{ id: "segurança", label: "🛡️ Segurança", color: "#c0392b" },
		{ id: "infraestrutura", label: "🏗️ Infraestrutura", color: "#e67e22" },
		{ id: "comportamento", label: "🚨 Comportamento", color: "#8e44ad" },
		{ id: "outro", label: "📝 Outro", color: "#2980b9" },
	];

	const declarar = async () => {
		if (!descricao.trim()) {
			Alert.alert("Atenção", "Descreva a ocorrência antes de enviar.");
			return;
		}

		try {
			setLoading(true);
			const user = auth.currentUser;

			const ocorrenciaData = {
				userId: user.uid,
				nome: user.displayName || "Anônimo",
				local: nomeEvento || "Local não definido",
				descricao: censurarTexto(descricao.trim()),
				tipo: tipoSelecionado || "outro",
				createdAt: serverTimestamp(),
			};

			// 1️⃣ salva na subcoleção do evento
			const ocorrenciaRef = await addDoc(
				collection(db, "eventos", eventoId, "ocorrencias"),
				ocorrenciaData
			);

			// 2️⃣ salva no histórico pessoal
			await addDoc(collection(db, "users", user.uid, "ocorrencias"), {
				ocorrenciaId: ocorrenciaRef.id,
				...ocorrenciaData,
				eventoId,
				tituloEvento: nomeEvento || "Evento",
			});

			Alert.alert("Sucesso", "Ocorrência registrada!");
			navigation.goBack();
		} catch (error) {
			console.log("Erro ao declarar ocorrência:", error);
			Alert.alert("Erro", "Não foi possível registrar a ocorrência.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={["#161421", "#211C35"]}
				style={[styles.header, { paddingTop: insets.top + 10 }]}
			>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialCommunityIcons
						name="arrow-left"
						size={26}
						color={Colors.primary}
					/>
				</TouchableOpacity>
				<AppText style={styles.headerTitle}>Declarar Ocorrência</AppText>
			</LinearGradient>

			<ScrollView contentContainerStyle={styles.content}>
				{/* LOCAL */}
				<View style={styles.card}>
					<AppText style={styles.label}>Evento</AppText>
					<AppText style={styles.localText}>{nomeEvento || "—"}</AppText>
				</View>

				{/* TIPO */}
				<View style={styles.card}>
					<AppText style={styles.label}>Tipo de ocorrência</AppText>
					<View style={styles.tiposGrid}>
						{tipos.map((tipo) => (
							<TouchableOpacity
								key={tipo.id}
								onPress={() => setTipoSelecionado(tipo.id)}
								style={[
									styles.tipoBadge,
									tipoSelecionado === tipo.id && {
										borderColor: tipo.color,
										backgroundColor: `${tipo.color}22`,
									},
								]}
							>
								<AppText
									style={[
										styles.tipoText,
										tipoSelecionado === tipo.id && { color: tipo.color },
									]}
								>
									{tipo.label}
								</AppText>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* DESCRIÇÃO */}
				<View style={styles.card}>
					<AppText style={styles.label}>Descreva o ocorrido</AppText>
					<TextInput
						value={descricao}
						onChangeText={setDescricao}
						placeholder="Forneça o máximo de detalhes possível..."
						placeholderTextColor="#777"
						multiline
						style={styles.input}
					/>
				</View>

				{/* AVISO */}
				<View style={styles.avisoCard}>
					<MaterialCommunityIcons
						name="information-outline"
						size={16}
						color="#aaa"
					/>
					<AppText style={styles.avisoText}>
						Sua ocorrência será registrada e encaminhada para análise.
					</AppText>
				</View>

				{/* BOTÃO */}
				<TouchableOpacity
					onPress={declarar}
					disabled={loading}
					style={[styles.button, loading && { opacity: 0.6 }]}
				>
					{loading ? (
						<ActivityIndicator color="#0c1f11" />
					) : (
						<AppText style={styles.buttonText}>Enviar Ocorrência</AppText>
					)}
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
	content: { padding: 16 },
	card: {
		backgroundColor: Colors.surface,
		borderColor: Colors.border,
		borderRadius: 16,
		padding: 16,
		marginBottom: 15,
		borderWidth: 1,
	},
	label: { color: "#aaa", fontSize: 13, marginBottom: 10 },
	localText: { color: Colors.primary, fontWeight: "bold", fontSize: 15 },
	tiposGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	tipoBadge: {
		borderWidth: 1,
		backgroundColor: Colors.background,
		borderColor: Colors.border,
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	tipoText: { color: "#aaa", fontSize: 13 },
	input: {
		backgroundColor: Colors.background,
		borderColor: Colors.border,
		borderRadius: 12,
		padding: 12,
		color: "#fff",
		height: 140,
		textAlignVertical: "top",
		borderWidth: 1,
		fontSize: 14,
	},
	avisoCard: {
		flexDirection: "row",
		gap: 8,
		alignItems: "flex-start",
		backgroundColor: Colors.background,
		borderRadius: 12,
		padding: 12,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: "#1f3d2a",
	},
	avisoText: { color: "#aaa", fontSize: 12, flex: 1, lineHeight: 18 },
	button: {
		backgroundColor: Colors.primary,
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginBottom: 30,
	},
	buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
