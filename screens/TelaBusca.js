import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Text,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventos } from "../services/mapaCulturalService";
import { Colors } from "../styles/Colors";

export default function TelaBusca({ navigation }) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  /* 🔥 CARREGAR EVENTOS */
  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setLoading(true);

      const response = await getEventos();

      const lista =
        Array.isArray(response)
          ? response
          : response?.data || response?.results || [];

      const tratados = lista.map((item, index) => ({
        id: item.id || index,
        titulo: item.name || "Evento",
        imagem:
          item?.files?.avatar?.url ||
          item?.files?.header?.url ||
          "https://placehold.co/400x200",
        local: item?.location?.name || "Local não informado",
        categoria: item?.type?.toLowerCase() || "outros",
        original: item,
      }));

      setEventos(tratados);
    } catch (e) {
      console.log("Erro ao carregar eventos:", e);
    } finally {
      setLoading(false);
    }
  };

  /* 🔎 FILTRO */
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((item) => {
      const matchQuery = item.titulo
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchCategoria = categoriaSelecionada
        ? item.categoria === categoriaSelecionada
        : true;

      return matchQuery && matchCategoria;
    });
  }, [query, eventos, categoriaSelecionada]);

  /* 🎭 CATEGORIAS */
  const categorias = [
    { nome: "comédia", icon: "emoticon-happy-outline" },
    { nome: "drama", icon: "drama-masks" },
    { nome: "shows", icon: "music" },
    { nome: "cinema", icon: "movie" },
    { nome: "gastronomia", icon: "silverware-fork-knife" },
    { nome: "infantil", icon: "baby-face-outline" },
  ];

  const renderCategoria = (item) => {
    const ativo = categoriaSelecionada === item.nome;

    return (
      <TouchableOpacity
        key={item.nome}
        style={[
          styles.chip,
          ativo && { backgroundColor: Colors.primary },
        ]}
        onPress={() =>
          setCategoriaSelecionada(ativo ? null : item.nome)
        }
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={ativo ? Colors.background : Colors.primary}
        />

        <Text
          style={[
            styles.chipText,
            ativo && { color: Colors.background },
          ]}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEvento = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Detalhes", { evento: item.original })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.img} />

      <View style={styles.cardInfo}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.local}>{item.local}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Buscar Eventos</Text>
        </View>

        {/* 🔎 BUSCA */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.textMuted}
          />

          <TextInput
            placeholder="Quais experiências iremos viver?"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* 🔄 LOADING */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView>
          {/* 🎭 CATEGORIAS */}
          <Text style={styles.section}>Gêneros</Text>

          <View style={styles.chipsContainer}>
            {categorias.map(renderCategoria)}
          </View>

          {/* 🔥 EVENTOS */}
          <Text style={styles.section}>Eventos próximos</Text>

          {eventosFiltrados.length === 0 ? (
            <Text style={styles.empty}>
              Nenhum evento encontrado 😕
            </Text>
          ) : (
            <FlatList
              data={eventosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEvento}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
            />
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    padding: 16,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },

  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    color: Colors.textPrimary,
    marginLeft: 10,
  },

  section: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 20,
    marginLeft: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },

  chipText: {
    color: Colors.textPrimary,
    marginLeft: 6,
    textTransform: "capitalize",
  },

  card: {
    width: 220,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: 120,
  },

  cardInfo: {
    padding: 10,
  },

  titulo: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },

  local: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
});