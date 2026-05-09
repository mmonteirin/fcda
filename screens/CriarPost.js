import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";
import { db } from "../firebaseConfig";

// ✅ Usa ImgBB em vez de Firebase Storage
import { uploadImagem } from "../services/uploadService";

// Tela ignorada/não usada, substituida por AdmCadastroEvento, ou seja, so adm criam post, usuários só vao ver o feed e detalhes do evento(para avaliar e declarar ocorrencia), sem criar posts
export default function CriarPost({ navigation }) {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();

  const [imagem, setImagem] = useState(null); // URI local (preview)
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* 📷 Escolher imagem */
  const escolherImagem = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permissão necessária", "Permita acesso à galeria.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        setImagem(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erro ao abrir galeria");
    }
  };

  /* 🚀 PUBLICAR */
  const publicar = async () => {
    if (!imagem) {
      Alert.alert("Atenção", "Selecione uma imagem");
      return;
    }

    if (!descricao.trim()) {
      Alert.alert("Atenção", "Digite uma descrição");
      return;
    }

    try {
      setLoading(true);

      // 1. Faz upload da imagem para ImgBB e obtém URL pública
      const imageUrl = await uploadImagem(imagem, user?.uid, (p) =>
        setUploadProgress(p)
      );

      // 2. Salva post no Firestore com a URL (string) da imagem
      await addDoc(collection(db, "posts"), {
        userId: user?.uid,
        nome: profile?.nome || user?.displayName || "Usuário",
        foto: profile?.foto || user?.photoURL || "https://i.pravatar.cc/100",
        imagemUrl: imageUrl,   // URL pública do ImgBB
        descricao: descricao.trim(),
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Post publicado!");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível publicar. Tente novamente.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const podePublicar = imagem && descricao.trim();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <AppText style={styles.title}>Novo Post</AppText>

          <TouchableOpacity
            onPress={publicar}
            disabled={!podePublicar || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <AppText
                style={[
                  styles.publicar,
                  !podePublicar && { opacity: 0.4 },
                ]}
              >
                Publicar
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        {/* Barra de progresso do upload */}
        {loading && uploadProgress > 0 && uploadProgress < 1 && (
          <AppText style={styles.progressText}>
            Enviando imagem: {Math.round(uploadProgress * 100)}%
          </AppText>
        )}
      </LinearGradient>

      {/* IMAGEM */}
      <TouchableOpacity style={styles.imageBox} onPress={escolherImagem}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons
              name="image-plus"
              size={40}
              color={Colors.primary}
            />
            <AppText style={styles.placeholderText}>
              Adicionar imagem
            </AppText>
          </View>
        )}
      </TouchableOpacity>

      {/* DESCRIÇÃO */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Escreva algo sobre esse momento..."
          placeholderTextColor={Colors.textMuted}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          style={styles.input}
        />
      </View>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },

  publicar: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },

  progressText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },

  imageBox: {
    height: 260,
    backgroundColor: Colors.surface,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    alignItems: "center",
  },

  placeholderText: {
    color: Colors.textSecondary,
    marginTop: 8,
  },

  inputContainer: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 14,
  },
});
