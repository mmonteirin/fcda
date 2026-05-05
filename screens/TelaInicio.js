import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { getEventos } from "../services/mapaCulturalService";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

const colors = Colors;

export default function TelaInicio() {
  const navigation = useNavigation();
  const { user, nome } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const categorias = ["Todos", "Shows", "Teatro", "Cinema", "Gastronomia"];

  const nomeUsuario =
    nome ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Explorador";

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const data = await getEventos();

      const tratados = data.map((item, index) => ({
        id: item.id || index,
        titulo: item?.name || "Evento",
        imagem:
          item?.files?.header?.url ||
          "https://placehold.co/400x200",
        local: item?.location?.name || "Local",
        categoria: item?.type || "outros",
        original: item,
      }));

      setEventos(tratados);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  /* 🎯 FILTRO POR CATEGORIA */
  const eventosFiltrados =
    categoriaAtiva === "Todos"
      ? eventos
      : eventos.filter((e) =>
          e.categoria.toLowerCase().includes(categoriaAtiva.toLowerCase())
        );

  const CardHorizontal = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardHorizontal}
      onPress={() =>
        navigation.navigate("Detalhes", { evento: item.original })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.imgHorizontal} />

      <Text style={styles.titleCard} numberOfLines={2}>
        {item.titulo}
      </Text>

      <Text style={styles.localCard}>📍 {item.local}</Text>
    </TouchableOpacity>
  );

  const CardVertical = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardVertical}
      onPress={() =>
        navigation.navigate("Detalhes", { evento: item.original })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.imgVertical} />

      <View style={{ padding: 12 }}>
        <Text style={styles.titleCard} numberOfLines={2}>
          {item.titulo}
        </Text>

        <Text style={styles.localCard}>📍 {item.local}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá,</Text>
          <Text style={styles.nome}>{nomeUsuario}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* BUSCA */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => navigation.navigate("Busca")}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.searchText}>
          Buscar eventos, shows, teatros...
        </Text>
      </TouchableOpacity>

      {/* CATEGORIAS */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorias}
        renderItem={({ item }) => {
          const ativo = item === categoriaAtiva;

          return (
            <TouchableOpacity
              onPress={() => setCategoriaAtiva(item)}
              style={[
                styles.categoria,
                {
                  backgroundColor: ativo
                    ? colors.primary
                    : colors.surface,
                },
              ]}
            >
              <Text
                style={{
                  color: ativo
                    ? colors.background
                    : colors.textSecondary,
                  fontWeight: ativo ? "bold" : "normal",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* DESTAQUES */}
      <Text style={styles.section}>Destaques</Text>

      <FlatList
        data={eventosFiltrados.slice(0, 6)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => <CardHorizontal item={item} />}
      />

      {/* PERTO DE VOCÊ */}
      <Text style={styles.section}>Perto de você</Text>

      {eventosFiltrados.length === 0 ? (
        <Text style={styles.empty}>
          Nenhum evento encontrado 😕
        </Text>
      ) : (
        <FlatList
          data={eventosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CardVertical item={item} />}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saudacao: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  nome: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
  },

  iconBtn: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },

  searchBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  searchText: {
    color: colors.textSecondary,
    marginLeft: 10,
  },

  categorias: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  categoria: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  section: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },

  cardHorizontal: {
    width: 160,
    marginRight: 12,
  },

  imgHorizontal: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },

  cardVertical: {
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: colors.card,
    overflow: "hidden",
  },

  imgVertical: {
    width: "100%",
    height: 150,
  },

  titleCard: {
    color: colors.textPrimary,
    fontWeight: "bold",
    marginTop: 5,
  },

  localCard: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});