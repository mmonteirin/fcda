import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "../components/AppText";
import { useAuth } from "../context/AuthContext";
import GlobalStyles from "../styles/GlobalStyles";

import {
  escutarFeed,
  toggleLike,
  escutarComentarios,
  adicionarComentario,
} from "../services/postService";

const { colors } = GlobalStyles;

export default function TelaFeed({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef({});
  const unsubscribeComentarios = useRef(null);

  useEffect(() => {
    const unsubscribe = escutarFeed((data) => {
      setPosts(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLike = async (postId) => {
    if (!scaleAnim.current[postId]) {
      scaleAnim.current[postId] = new Animated.Value(1);
    }

    await toggleLike(postId, user);

    Animated.sequence([
      Animated.timing(scaleAnim.current[postId], {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim.current[postId], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const abrirComentarios = (post) => {
    setPostSelecionado(post);
    setModalVisible(true);

    if (unsubscribeComentarios.current) {
      unsubscribeComentarios.current();
    }

    unsubscribeComentarios.current = escutarComentarios(
      post.id,
      setComentarios
    );
  };

  const fecharModal = () => {
    setModalVisible(false);
    setComentarios([]);
    setPostSelecionado(null);

    if (unsubscribeComentarios.current) {
      unsubscribeComentarios.current();
      unsubscribeComentarios.current = null;
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    await adicionarComentario(postSelecionado.id, {
      user,
      texto: novoComentario,
    });

    setNovoComentario("");
  };

  const renderItem = ({ item }) => {
    if (!scaleAnim.current[item.id]) {
      scaleAnim.current[item.id] = new Animated.Value(1);
    }

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imagem }} style={styles.imagem} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.overlay}
        />

        <View style={styles.conteudo}>
          <View style={styles.userRow}>
            <Image source={{ uri: item.foto }} style={styles.avatar} />
            <AppText style={styles.nome}>{item.nome}</AppText>
          </View>

          <AppText style={styles.descricao}>{item.descricao}</AppText>

          <View style={styles.actions}>
            <View style={styles.leftActions}>
              <TouchableOpacity onPress={() => handleLike(item.id)}>
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnim.current[item.id] }],
                  }}
                >
                  <MaterialCommunityIcons
                    name="heart"
                    size={26}
                    color={colors.primary}
                  />
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => abrirComentarios(item)}>
                <MaterialCommunityIcons
                  name="comment-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            <MaterialCommunityIcons
              name="share-variant"
              size={22}
              color={colors.primary}
            />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <AppText style={styles.headerTitle}>Feed</AppText>

        <TouchableOpacity
          onPress={() => navigation.navigate("CriarPost")}
          style={styles.addButton}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <AppText style={styles.empty}>
            Nenhum post ainda 😢
          </AppText>
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <AppText style={styles.modalTitle}>Comentários</AppText>

          <FlatList
            data={comentarios}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <AppText style={styles.empty}>
                Nenhum comentário ainda
              </AppText>
            }
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Image source={{ uri: item.foto }} style={styles.avatar} />
                <View>
                  <AppText style={styles.commentNome}>
                    {item.nome}
                  </AppText>
                  <AppText style={styles.commentTexto}>
                    {item.texto}
                  </AppText>
                </View>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Comentar..."
              placeholderTextColor={colors.textMuted}
              value={novoComentario}
              onChangeText={setNovoComentario}
              style={styles.input}
            />

            <TouchableOpacity onPress={enviarComentario}>
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={fecharModal}>
            <AppText style={styles.fechar}>Fechar</AppText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.card,
  },

  imagem: {
    width: "100%",
    height: 230,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 140,
  },

  conteudo: {
    position: "absolute",
    bottom: 0,
    padding: 16,
    width: "100%",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 20,
    marginRight: 8,
  },

  nome: {
    color: colors.primary,
    fontWeight: "bold",
  },

  descricao: {
    marginTop: 4,
    color: colors.textPrimary,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  leftActions: {
    flexDirection: "row",
    gap: 16,
  },

  modal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: colors.textPrimary,
  },

  comment: {
    flexDirection: "row",
    marginBottom: 12,
  },

  commentNome: {
    color: colors.primary,
    fontWeight: "bold",
  },

  commentTexto: {
    color: colors.textPrimary,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    color: colors.textPrimary,
    marginRight: 10,
  },

  fechar: {
    color: colors.error,
    textAlign: "center",
    marginTop: 10,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textSecondary,
  },
});
