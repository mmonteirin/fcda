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

import { useAuth } from "../context/AuthContext";
import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function CriarPost({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [imagem, setImagem] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  // 📷 Escolher imagem
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

  // 🚀 PUBLICAÇÃO FAKE
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

      // 🔥 SIMULA DELAY DE API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 🔥 POST FAKE
      const postFake = {
        id: Date.now().toString(),
        userId: user?.uid || "fake-user",
        nome: user?.displayName || "Usuário",
        foto: user?.photoURL || "https://i.pravatar.cc/100",
        imagem: imagem,
        descricao: descricao.trim(),
        createdAt: new Date(),

        // extras pra parecer real
        likes: Math.floor(Math.random() * 200),
        comentarios: Math.floor(Math.random() * 50),
      };

      console.log("POST FAKE:", postFake);

      Alert.alert("Sucesso", "Post publicado!");
      navigation.goBack();

    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível publicar");
    } finally {
      setLoading(false);
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
