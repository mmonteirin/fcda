import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Text,
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
  const [popupMostrado, setPopupMostrado] = useState(false);

  /* 🔥 CARREGAR EVENTOS */
  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
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
        categoria: item?.type || "outros",
        publico: true,
        original: item,
      }));

      setEventos(tratados);
    } catch (e) {
      console.log("Erro ao carregar eventos:", e);
    }
  };

  /* 🔥 POPUP CONTROLADO (SEM LOOP) */
  useEffect(() => {
    if (eventos.length > 0 && !popupMostrado) {
      Alert.alert(
        "Evento Público",
        "Evento com Apoio da Secretária de Cultura do Governo do Estado do Ceará\n\nVisite: https://www.secult.ce.gov.br/"
      );
      setPopupMostrado(true);
    }
  }, [eventos]);

  /* 🔎 FILTRO OTIMIZADO */
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((item) =>
      item.titulo.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, eventos]);

  /* 🎭 CATEGORIAS */
  const categorias = [
    { nome: "Comédia", icon: "emoticon-happy-outline" },
    { nome: "Drama", icon: "drama-masks" },
    { nome: "Shows", icon: "music" },
    { nome: "Cinema", icon: "movie" },
    { nome: "Gastronomia", icon: "silverware-fork-knife" },
    { nome: "Infantil", icon: "baby-face-outline" },
  ];

  const renderCategoria = (item) => (
    <TouchableOpacity key={item.nome} style={styles.chip}>
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={Colors.primary}
      />
      <Text style={styles.chipText}>{item.nome}</Text>
    </TouchableOpacity>
  );

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
      {/* 🔥 HEADER COM VOLTAR */}
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
        </View>
      </LinearGradient>

      <ScrollView>
        {/* 🎭 CATEGORIAS */}
        <Text style={styles.section}>Gêneros</Text>

        <View style={styles.chipsContainer}>
          {categorias.map(renderCategoria)}
        </View>

        {/* 🔥 EVENTOS */}
        <Text style={styles.section}>Eventos próximos</Text>

        <FlatList
          data={query ? eventosFiltrados : eventos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvento}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* 🎨 STYLES (INALTERADO) */
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
});