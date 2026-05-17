import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
	Modal,
	ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { db, auth } from "../firebaseConfig";
import {
	collection,
	addDoc,
	serverTimestamp,
	doc,
	setDoc,
} from "firebase/firestore";

// ✅ Usa ImgBB em vez de Firebase Storage
import { uploadImagem } from "../services/uploadService";
import { geocodeAddress } from "../services/geocodingService";

import { Colors } from "../styles/Colors";

/* 🔥 MÁSCARAS */
const maskCEP = (t) =>
	t
		.replace(/\D/g, "")
		.replace(/^(\d{5})(\d)/, "$1-$2")
		.slice(0, 9);

const maskData = (t) =>
	t
		.replace(/\D/g, "")
		.replace(/^(\d{2})(\d)/, "$1/$2")
		.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
		.slice(0, 10);

const maskHora = (t) =>
	t
		.replace(/\D/g, "")
		.replace(/^(\d{2})(\d)/, "$1:$2")
		.slice(0, 5);

/* 🔥 SELECT MODAL */
const SelectModal = ({ label, value, options, onSelect }) => {
	const [visible, setVisible] = useState(false);

	return (
		<>
			<Text style={{ color: Colors.textPrimary, marginBottom: 8 }}>
				{label}
			</Text>
			<TouchableOpacity onPress={() => setVisible(true)} style={selectStyle}>
				<Text style={{ color: value ? Colors.textPrimary : Colors.textMuted }}>
					{value || "Selecione..."}
				</Text>
				<MaterialCommunityIcons
					name="chevron-down"
					size={22}
					color={Colors.primary}
				/>
			</TouchableOpacity>

			<Modal visible={visible} transparent animationType="fade">
				<View style={modalOverlay}>
					<View style={modalBox}>
						{options.map((item) => {
							const ativo = value === item;
							return (
								<TouchableOpacity
									key={item}
									onPress={() => {
										onSelect(item);
										setVisible(false);
									}}
									style={[
										modalItem,
										{ backgroundColor: ativo ? Colors.primary : "transparent" },
									]}
								>
									<Text
										style={{
											color: ativo ? Colors.background : Colors.textPrimary,
										}}
									>
										{item}
									</Text>
								</TouchableOpacity>
							);
						})}
						<TouchableOpacity onPress={() => setVisible(false)}>
							<Text
								style={{ color: Colors.textSecondary, textAlign: "center" }}
							>
								Cancelar
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
};

export default function AdmCadastroEvento({ navigation }) {
	const [form, setForm] = useState({});
	const [imagem, setImagem] = useState(null); // URI local (preview)
	const [loading, setLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const setField = (key, value) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	/* 📸 ESCOLHER IMAGEM */
	const pickImage = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Permissão necessária", "Permita acesso à galeria.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			quality: 0.4,
			allowsEditing: true,
			aspect: [16, 9],
		});
		if (!result.canceled) setImagem(result.assets[0].uri);
	};

	/* 🔍 BUSCAR CEP */
	const buscarCEP = async () => {
		const cepLimpo = form.cep?.replace(/\D/g, "");
		if (!cepLimpo || cepLimpo.length !== 8) {
			Alert.alert("Digite um CEP válido");
			return;
		}
		try {
			const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
			const data = await res.json(); // desnecessario? res ja é json?
			if (data.erro) {
				Alert.alert("CEP não encontrado");
				return;
			}
			setForm((prev) => ({
				...prev,
				rua: data.logradouro || "",
				bairro: data.bairro || "",
				cidade: data.localidade || "",
				uf: data.uf || "",
				localEvento: data.logradouro || prev.localEvento || "",
			}));
		} catch {
			Alert.alert("Erro ao buscar CEP");
		}
	};

	/* 🚀 SUBMIT */
	const handleSubmit = async () => {
		if (!form.tituloEvento) {
			Alert.alert("Preencha o nome do evento");
			return;
		}

		try {
			setLoading(true);
			const user = auth.currentUser;

			// ✅ Upload via ImgBB (não usa Firebase Storage)
			let imageUrl = "";
			if (imagem) {
				imageUrl = await uploadImagem(imagem, user?.uid, (p) =>
					setUploadProgress(p)
				);
			}

const latitude = form.latitude ? Number(form.latitude) : null;
      const longitude = form.longitude ? Number(form.longitude) : null;
      let finalLatitude = latitude;
      let finalLongitude = longitude;
      const enderecoParaGeocode =
        form.localEvento ||
        [form.rua, form.bairro, form.cidade, form.uf]
          .filter(Boolean)
          .join(", ");

      if ((finalLatitude == null || finalLongitude == null) && enderecoParaGeocode) {
        const coords = await geocodeAddress(enderecoParaGeocode);
      }

      // 1️⃣ Salva em /eventos
      const eventoRef = await addDoc(collection(db, "eventos"), {
        tituloEvento: form.tituloEvento,
        dataEvento: form.dataEvento || "",
        imagemEvento: imageUrl, // URL pública do ImgBB
        localEvento: form.localEvento || form.rua || "",
        userId: user?.uid || "", // campo para as Firestore rules
        uidEvento: user?.uid || "",
        nomeLocal: form.nomeLocal || "",
        horaInicio: form.horaInicio || "",
        horaFim: form.horaFim || "",
        categoria: form.categoria || "",
        tipoEvento: form.tipoEvento || "",
        descricao: form.descricao || "",
        cep: form.cep || "",
        bairro: form.bairro || "",
        cidade: form.cidade || "",
        uf: form.uf || "",
        latitude: finalLatitude,
        longitude: finalLongitude,
				likes: 0,
				views: 0,
				comentarios: 0,
				ativo: true,
				adminNome: user?.displayName || "Organizador",
				createdAt: serverTimestamp(),
			});

			// 2️⃣ Publica no feed
			await addDoc(collection(db, "feedEventos"), {
				eventoId: eventoRef.id,
				tituloEvento: form.tituloEvento,
				descricao: form.descricao || "",
				imagemEvento: imageUrl,
				dataEvento: form.dataEvento || "",
				localEvento: form.localEvento || form.rua || form.cidade || "",
				tipoEvento: form.tipoEvento || "",
				categoria: form.categoria || "",
				userId: user?.uid || "",
				uidEvento: user?.uid || "",
				adminNome: user?.displayName || "Organizador",
				createdAt: serverTimestamp(),
			});

			console.log("Evento criado");
			Alert.alert("Sucesso", "Evento criado e publicado no feed!");
			navigation.goBack();
		} catch (e) {
			console.log("Erro:", e);
			Alert.alert("Erro ao salvar", e.message || "Tente novamente.");
		} finally {
			setLoading(false);
			setUploadProgress(0);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: Colors.background }}>
			{/* HEADER */}
			<LinearGradient
				colors={[Colors.background, Colors.surface]}
				style={header}
			>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialCommunityIcons
						name="arrow-left"
						size={26}
						color={Colors.primary}
					/>
				</TouchableOpacity>
				<Text style={title}>Criar Evento</Text>
			</LinearGradient>

			<ScrollView contentContainerStyle={{ padding: 20 }}>
				{/* IMAGEM + SELECTS */}
				<View style={{ flexDirection: "row" }}>
					<TouchableOpacity
						onPress={pickImage}
						style={{ flex: 1, marginRight: 10 }}
					>
						{imagem ? (
							<Image source={{ uri: imagem }} style={image} />
						) : (
							<View style={imagePlaceholder}>
								<MaterialCommunityIcons
									name="image-plus"
									size={40}
									color={Colors.primary}
								/>
								<Text style={{ color: Colors.textSecondary }}>
									Adicionar imagem
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<View style={{ flex: 1 }}>
						<SelectModal
							label="Categoria"
							value={form.categoria}
							options={["Teatro", "Shows", "Cinema", "Dança", "Arte", "Música"]}
							onSelect={(v) => setField("categoria", v)}
						/>
						<View style={{ marginTop: 10 }}>
							<SelectModal
								label="Tipo"
								value={form.tipoEvento}
								options={["gratuito", "pago"]}
								onSelect={(v) => setField("tipoEvento", v)}
							/>
						</View>
					</View>
				</View>

				{/* tituloEvento */}
				<TextInput
					placeholder="Nome do evento"
					placeholderTextColor={Colors.textMuted}
					value={form.tituloEvento || ""}
					onChangeText={(v) => setField("tituloEvento", v)}
					style={input}
				/>

				{/* descricao */}
				<TextInput
					placeholder="Descrição do evento"
					placeholderTextColor={Colors.textMuted}
					value={form.descricao || ""}
					onChangeText={(v) => setField("descricao", v)}
					multiline
					numberOfLines={3}
					style={[input, { height: 80, textAlignVertical: "top" }]}
				/>

				{/* dataEvento */}
				<TextInput
					placeholder="Data (DD/MM/AAAA)"
					placeholderTextColor={Colors.textMuted}
					keyboardType="numeric"
					value={form.dataEvento || ""}
					onChangeText={(v) => setField("dataEvento", maskData(v))}
					style={input}
				/>

				{/* horaInicio / horaFim */}
				<View style={{ flexDirection: "row" }}>
					<TextInput
						placeholder="Início"
						placeholderTextColor={Colors.textMuted}
						keyboardType="numeric"
						value={form.horaInicio || ""}
						onChangeText={(v) => setField("horaInicio", maskHora(v))}
						style={[input, { flex: 1, marginRight: 10 }]}
					/>
					<TextInput
						placeholder="Término"
						placeholderTextColor={Colors.textMuted}
						keyboardType="numeric"
						value={form.horaFim || ""}
						onChangeText={(v) => setField("horaFim", maskHora(v))}
						style={[input, { flex: 1 }]}
					/>
				</View>

				{/* CEP */}
				<View style={{ flexDirection: "row", marginTop: 10 }}>
					<TextInput
						value={form.cep || ""}
						placeholder="CEP"
						placeholderTextColor={Colors.textMuted}
						keyboardType="numeric"
						onChangeText={(v) => setField("cep", maskCEP(v))}
						style={[input, { flex: 1, marginRight: 10 }]}
					/>
					<TextInput
						value={form.rua || ""}
						placeholder="Rua"
						placeholderTextColor={Colors.textMuted}
						onChangeText={(v) => {
							setField("rua", v);
							setField("localEvento", v);
						}}
						style={[input, { flex: 2 }]}
					/>
					<TouchableOpacity onPress={buscarCEP} style={btnCep}>
						<MaterialCommunityIcons
							name="magnify"
							size={22}
							color={Colors.textPrimary}
						/>
					</TouchableOpacity>
				</View>

				{/* nomeLocal */}
				<TextInput
					value={form.nomeLocal || ""}
					placeholder="Nome do local (ex: Teatro Carlos Gomes)"
					placeholderTextColor={Colors.textMuted}
					onChangeText={(v) => setField("nomeLocal", v)}
					style={input}
				/>

				<View style={{ flexDirection: "row", gap: 10 }}>
					<TextInput
						value={form.latitude || ""}
						placeholder="Latitude"
						placeholderTextColor={Colors.textMuted}
						keyboardType="numeric"
						onChangeText={(v) => setField("latitude", v)}
						style={[input, { flex: 1 }]}
					/>
					<TextInput
						value={form.longitude || ""}
						placeholder="Longitude"
						placeholderTextColor={Colors.textMuted}
						keyboardType="numeric"
						onChangeText={(v) => setField("longitude", v)}
						style={[input, { flex: 1 }]}
					/>
				</View>

				{/* Progresso de upload */}
				{loading && uploadProgress > 0 && uploadProgress < 1 && (
					<Text
						style={{
							color: Colors.textSecondary,
							marginTop: 8,
							textAlign: "center",
						}}
					>
						Enviando imagem: {Math.round(uploadProgress * 100)}%
					</Text>
				)}

				{/* BOTÃO */}
				<TouchableOpacity
					onPress={handleSubmit}
					style={[btn, loading && { opacity: 0.6 }]}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color={Colors.background} />
					) : (
						<Text style={{ fontWeight: "bold", color: Colors.background }}>
							Cadastrar
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

/* 🎨 STYLES */
const header = {
	paddingTop: 50,
	padding: 20,
	borderBottomLeftRadius: 20,
	borderBottomRightRadius: 20,
};
const title = { color: Colors.textPrimary, fontSize: 24, marginTop: 10 };
const input = {
	backgroundColor: Colors.surface,
	color: Colors.textPrimary,
	padding: 14,
	borderRadius: 14,
	marginTop: 10,
};
const selectStyle = {
	backgroundColor: Colors.surface,
	padding: 16,
	borderRadius: 16,
	borderWidth: 1,
	borderColor: Colors.border,
	flexDirection: "row",
	justifyContent: "space-between",
};
const btnCep = {
	backgroundColor: Colors.primary,
	padding: 14,
	marginLeft: 10,
	borderRadius: 14,
	justifyContent: "center",
};
const btn = {
	backgroundColor: Colors.primary,
	padding: 16,
	borderRadius: 14,
	marginTop: 20,
	alignItems: "center",
};
const image = { height: 180, borderRadius: 16 };
const imagePlaceholder = {
	height: 180,
	borderRadius: 16,
	backgroundColor: Colors.surface,
	justifyContent: "center",
	alignItems: "center",
};
const modalOverlay = {
	flex: 1,
	backgroundColor: "rgba(0,0,0,0.6)",
	justifyContent: "center",
	padding: 20,
};
const modalBox = {
	backgroundColor: Colors.surface,
	borderRadius: 20,
	padding: 15,
};
const modalItem = { padding: 15, borderRadius: 12, marginBottom: 8 };
