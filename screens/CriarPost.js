import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { uploadImagem } from "../services/uploadService";
import { criarPost } from "../services/postService";
import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function CriarPost({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [imagem, setImagem] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      mediaTypes: ["images"],
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const publicar = async () => {
    if (!imagem || !descricao) return;

    try {
      setLoading(true);

      const url = await uploadImagem(imagem, user.uid);

      await criarPost({
        userId: user.uid,
        nome: user.displayName,
        foto: user.photoURL,
        imagem: url,
        descricao,
      });

      navigation.goBack();
    } catch (e) {
      console.log(e);
      alert("Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

          <TouchableOpacity onPress={publicar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <AppText style={styles.publicar}>Publicar</AppText>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Descrição..."
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

/* 🎨 STYLES */
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
  },

  imageBox: {
    height: 250,
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
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
