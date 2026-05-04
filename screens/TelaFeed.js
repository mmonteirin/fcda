import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function TelaFeed() {
  const route = useRoute();

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 POSTS INICIAIS FAKE
  useEffect(() => {
    const fakePosts = [
      {
        id: "1",
        nome: "Marcos Monteiro",
        foto: "https://i.pravatar.cc/100?img=1",
        imagem: "https://placehold.co/600x400/0f172a/ffffff?text=Evento",
        descricao: "Que evento absurdo 🔥",
        likes: 132,
        comentarios: 21,
      },
      {
        id: "2",
        nome: "Ana Souza",
        foto: "https://i.pravatar.cc/100?img=5",
        imagem: "https://placehold.co/600x400/7c3aed/ffffff?text=Festa",
        descricao: "Melhor noite do ano 💜",
        likes: 89,
        comentarios: 12,
      },
      {
        id: "3",
        nome: "Lucas Lima",
        foto: "https://i.pravatar.cc/100?img=8",
        imagem: "https://placehold.co/600x400/1e293b/ffffff?text=Show",
        descricao: "Lotado demais 🔥🔥",
        likes: 201,
        comentarios: 45,
      },
    ];

    setPosts(fakePosts);
  }, []);

  // 🔥 RECEBE NOVO POST
  useEffect(() => {
    if (route.params?.novoPost) {
      setPosts((prev) => [route.params.novoPost, ...prev]);
    }
  }, [route.params?.novoPost]);

  // 🔄 REFRESH FAKE
  const onRefresh = async () => {
    setRefreshing(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={{ uri: item.foto }} style={styles.avatar} />
        <AppText style={styles.nome}>{item.nome}</AppText>
      </View>

      {/* IMAGEM */}
      <Image source={{ uri: item.imagem }} style={styles.image} />

      {/* AÇÕES */}
      <View style={styles.actions}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="comment-outline"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.info}>
        <AppText style={styles.likes}>
          {item.likes} curtidas
        </AppText>

        <AppText style={styles.descricao}>
          <AppText style={{ fontWeight: "bold" }}>
            {item.nome}{" "}
          </AppText>
          {item.descricao}
        </AppText>

        <AppText style={styles.comentarios}>
          {item.comentarios} comentários
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
      />
    </View>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  card: {
    backgroundColor: Colors.card,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  nome: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 280,
  },

  actions: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  info: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  likes: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },

  descricao: {
    color: Colors.textPrimary,
    marginTop: 4,
  },

  comentarios: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
};
