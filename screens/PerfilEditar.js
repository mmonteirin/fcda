import React, { useState, useEffect } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImagem } from "../services/uploadService";

import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function PerfilEditar({ navigation }) {
	const insets = useSafeAreaInsets();
	const { user, nome: nomeContext, foto: fotoContext } = useAuth();

	const [nome, setNome] = useState(nomeContext || "");
	const [foto, setFoto] = useState(fotoContext || "");
	const [telefone, setTelefone] = useState("");
	const [cpf, setCpf] = useState("");
	const [loading, setLoading] = useState(false);

	const formatarTelefone = (text) => {
    // Remove tudo que não for número
    const numbers = text.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    if (numbers.length > 11) return;

    // Formatação manual: (99) 9 9999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      const ddd = numbers.slice(0, 2);
      const nono = numbers.slice(2, 3);
      const resto = numbers.slice(3);
      
      if (resto.length <= 4) {
        return `(${ddd}) ${nono} ${resto}`;
      } else {
        const parte1 = resto.slice(0, 4);
        const parte2 = resto.slice(4, 8);
        return `(${ddd}) ${nono} ${parte1}-${parte2}`;
      }
    }
    return numbers;
  };

  const handleTelChange = (text) => {
    const formatted = formatarTelefone(text);
    setTelefone(formatted);
  };

	/* 🔄 carregar dados */
	useEffect(() => {
		const carregarDados = async () => {
			try {
				const docRef = doc(db, "users", user.uid);
				const snap = await getDoc(docRef);

				if (snap.exists()) {
					const data = snap.data();
					setTelefone(data.telefone || "");
					setCpf(data.cpf || "");
				}
			} catch (error) {
				console.log(error);
			}
		};

		if (user) carregarDados();
	}, [user]);

	/* 📸 escolher foto */
	const escolherFoto = async () => {
		const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissao.granted) {
			Alert.alert("Permissão necessária!");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.Images,
			quality: 0.4,
		});

		if (!result.canceled) {
			setFoto(result.assets[0].uri);
		}
	};

	/* 💾 salvar */
	const salvar = async () => {
		if (!nome.trim()) {
			Alert.alert("Informe o nome");
			return;
		}

		try {
			setLoading(true);

			let fotoFinal = foto;

			if (foto && !foto.startsWith("https")) {
				fotoFinal = await uploadImagem(foto, user.uid);
			}

			const userRef = doc(db, "users", user.uid);

			// Firebase Auth
			await updateProfile(auth.currentUser, {
				displayName: nome,
				photoURL: fotoFinal,
			});

			// Firestore
			await setDoc(
				userRef,
				{
					nome,
					foto: fotoFinal,
					telefone,
					cpf,
					email: user.email,
				},
				{ merge: true }
			);

			setFoto(fotoFinal);

			Alert.alert("Sucesso", "Dados atualizados!");

			navigation.goBack();
		} catch (error) {
			console.log(error);
			Alert.alert("Erro", error.message || "Erro ao salvar");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			{/* 🔥 HEADER */}
			<LinearGradient
				colors={[Colors.background, Colors.surface]}
				style={[styles.header, { paddingTop: insets.top + 10 }]}
			>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<MaterialCommunityIcons
						name="arrow-left"
						size={26}
						color={Colors.primary}
					/>
				</TouchableOpacity>

				<AppText style={styles.headerTitle}>Editar Perfil</AppText>
			</LinearGradient>

			{/* 👤 AVATAR */}
			<View style={styles.avatarWrapper}>
				<Image
					source={{
						uri:
							typeof foto === "string" && foto.length > 0
								? foto
								: "https://i.pravatar.cc/150",
					}}
					style={styles.avatar}
				/>

				<TouchableOpacity onPress={escolherFoto} style={styles.cameraButton}>
					<MaterialCommunityIcons name="camera" size={18} color="#fff" />
				</TouchableOpacity>
			</View>

			{/* 📝 FORM */}
			<View style={styles.card}>
				<AppText style={styles.label}>Nome</AppText>
				<TextInput
					style={styles.input}
					placeholder="Nome"
					placeholderTextColor={Colors.textMuted}
					value={nome}
					onChangeText={setNome}
				/>

				<AppText style={styles.label}>Email</AppText>
				<TextInput
					style={[styles.input, styles.disabled]}
					value={user?.email}
					editable={false}
				/>

				<AppText style={styles.label}>Telefone</AppText>
				<TextInput
					style={styles.input}
					placeholder="Telefone"
					placeholderTextColor={Colors.textMuted}
					value={telefone}
					onChangeText={handleTelChange}
				/>

				<AppText style={styles.label}>CPF</AppText>
				<TextInput
					style={styles.input}
					placeholder="CPF"
					placeholderTextColor={Colors.textMuted}
					value={cpf}
					onChangeText={setCpf}
				/>

				{/* 🚀 BOTÃO */}
				<TouchableOpacity
					onPress={salvar}
					disabled={loading}
					style={styles.button}
				>
					{loading ? (
						<ActivityIndicator color={Colors.textPrimary} />
					) : (
						<AppText style={styles.buttonText}>Salvar Alterações</AppText>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

/* 🎨 STYLES */
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

	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},

	avatarWrapper: {
    width: 110, 
    height: 110,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    position: "relative",
  },

	avatar: {
		width: 110,
		height: 110,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: Colors.primary,
	},

	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: Colors.primary,
		padding: 8,
		borderRadius: 20,
	},

	card: {
		backgroundColor: Colors.surface,
		margin: 16,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border,
	},

	label: {
		color: Colors.textSecondary,
		fontSize: 13,
		marginBottom: 6,
		marginTop: 10,
	},

	input: {
		backgroundColor: Colors.input,
		color: Colors.textPrimary,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},

	disabled: {
		opacity: 0.5,
	},

	button: {
		marginTop: 20,
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 14,
		alignItems: "center",
	},

	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
});
