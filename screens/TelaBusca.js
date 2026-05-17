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
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventos } from "../services/mapaCulturalService";
import { Colors } from "../styles/Colors";

export default function TelaBusca({ navigation }) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setLoading(true);

      const response = await getEventos();

      const lista = Array.isArray(response)
        ? response
        : response?.data || response?.results || [];

      const tratados = lista.map((item, index) => ({
        id: item.id || index,
        titulo: item.name || "Evento",
        imagem:
          item?.files?.header?.url ||
          item?.files?.avatar?.url ||
          "https://placehold.co/600x400",
        local:
          item?.location?.name || "Local não informado",
        categoria:
          item?.type?.toLowerCase() || "outros",
        descricao:
          item?.shortDescription ||
          "Descubra uma experiência incrível",
        original: item,
      }));

      setEventos(tratados);
    } catch (e) {
      console.log("Erro ao carregar eventos:", e);
    } finally {
      setLoading(false);
    }
  };

  /* 🔍 FILTRO */
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
    {
      nome: "comédia",
      icon: "emoticon-happy-outline",
    },
    { nome: "drama", icon: "drama-masks" },
    { nome: "shows", icon: "music" },
    { nome: "cinema", icon: "movie" },
    {
      nome: "gastronomia",
      icon: "silverware-fork-knife",
    },
    {
      nome: "infantil",
      icon: "baby-face-outline",
    },
  ];

  const renderCategoria = (item) => {
    const ativo = categoriaSelecionada === item.nome;

    return (
      <TouchableOpacity
        key={item.nome}
        activeOpacity={0.8}
        style={[
          styles.chip,
          ativo && styles.chipActive,
        ]}
        onPress={() =>
          setCategoriaSelecionada(
            ativo ? null : item.nome
          )
        }
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={18}
          color={
            ativo
              ? Colors.background
              : Colors.primary
          }
        />

        <Text
          style={[
            styles.chipText,
            ativo && styles.chipTextActive,
          ]}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEvento = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate("Detalhes", {
          evento: item.original,
        })
      }
    >
      <Image
        source={{ uri: item.imagem }}
        style={styles.img}
      />

      {/* Overlay */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.8)",
        ]}
        style={styles.overlay}
      />

      {/* Badge */}
      <View style={styles.badge}>
        <MaterialCommunityIcons
          name="sparkles"
          size={12}
          color="#fff"
        />
        <Text style={styles.badgeText}>
          Em destaque
        </Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text numberOfLines={1} style={styles.titulo}>
          {item.titulo}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.descricao}
        >
          {item.descricao}
        </Text>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={15}
            color="#fff"
          />

          <Text
            numberOfLines={1}
            style={styles.local}
          >
            {item.local}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={[
          "#1A1333",
          Colors.background,
        ]}
        style={[
          styles.header,
          { paddingTop: insets.top + 10 },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Explorar Eventos
            </Text>

            <Text style={styles.headerSub}>
              Descubra experiências incríveis ✨
            </Text>
          </View>
        </View>

        {/* BUSCA */}
        <BlurView
          intensity={40}
          tint="dark"
          style={styles.searchBox}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={Colors.textMuted}
          />

          <TextInput
            placeholder="Buscar eventos..."
            placeholderTextColor={
              Colors.textMuted
            }
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </BlurView>
      </LinearGradient>

      {/* LOADING */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />

          <Text style={styles.loadingText}>
            Buscando experiências...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {/* CATEGORIAS */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>
              Categorias
            </Text>

            <TouchableOpacity
              onPress={() =>
                setCategoriaSelecionada(null)
              }
            >
              <Text style={styles.clearText}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 5,
            }}
          >
            {categorias.map(renderCategoria)}
          </ScrollView>

          {/* EVENTOS */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>
              Eventos próximos
            </Text>

            <Text style={styles.count}>
              {eventosFiltrados.length} encontrados
            </Text>
          </View>

          {eventosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="emoticon-sad-outline"
                size={60}
                color={Colors.textMuted}
              />

              <Text style={styles.empty}>
                Nenhum evento encontrado
              </Text>
            </View>
          ) : (
            <FlatList
              data={eventosFiltrados}
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={renderEvento}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 16,
                paddingBottom: 30,
              }}
            />
          )}

          <View style={{ height: 80 }} />
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: 12,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSub: {
    color: Colors.textMuted,
    marginTop: 4,
    fontSize: 13,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 14,
  },

  section: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  clearText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  count: {
    color: Colors.textMuted,
    fontSize: 12,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  chipActive: {
    backgroundColor: Colors.primary,
  },

  chipText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  chipTextActive: {
    color: Colors.background,
  },

  card: {
    width: 290,
    height: 360,
    marginRight: 16,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    marginLeft: 5,
    fontWeight: "600",
  },

  cardInfo: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 18,
  },

  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  descricao: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  local: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 13,
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: Colors.textMuted,
    marginTop: 12,
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  empty: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 15,
  },
});