import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Text,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventosApp } from "../services/eventosAppService";
import { getEventos } from "../services/mapaCulturalService";
import { Colors } from "../styles/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ────────────────────────────────────────────────────────────── */
/* NORMALIZA EVENTOS */
/* ────────────────────────────────────────────────────────────── */

function normalizarApp(item) {
  return {
    id: `app_${item.id}`,
    titulo: item.tituloEvento || item.name || "Evento",
    imagem:
      item.imagemEvento ||
      item.files?.header?.url ||
      "https://placehold.co/600x400?text=Evento",
    local:
      item.localEvento ||
      item.nomeLocal ||
      item.location?.name ||
      "Local não informado",
    categoria:
      (item.categoria || item.tipoEvento || "outros").toLowerCase(),
    descricao:
      item.descricao ||
      item.shortDescription ||
      "Evento cadastrado no MonitoraCult",
    score: item.score || 0,
    likes: item.likes || 0,
    views: item.views || 0,
    origem: "app",
    original: item,
  };
}

function normalizarMapa(item, index) {
  return {
    id: `mapa_${item.id || index}`,
    titulo: item.name || "Evento",
    imagem:
      item?.files?.header?.url ||
      item?.files?.avatar?.url ||
      "https://placehold.co/600x400?text=Evento",
    local: item?.location?.name || "Local não informado",
    categoria: (item?.type || "outros").toLowerCase(),
    descricao:
      item?.shortDescription ||
      "Evento do Mapa Cultural do Ceará",
    score: 0,
    likes: 0,
    views: 0,
    origem: "mapa",
    original: item,
  };
}

/* ────────────────────────────────────────────────────────────── */
/* CATEGORIAS */
/* ────────────────────────────────────────────────────────────── */

const CATEGORIAS = [
  { nome: "teatro", icon: "drama-masks" },
  { nome: "shows", icon: "music" },
  { nome: "cinema", icon: "movie" },
  { nome: "exposição", icon: "image-frame" },
  { nome: "dança", icon: "human" },
  { nome: "gastronomia", icon: "silverware-fork-knife" },
  { nome: "infantil", icon: "baby-face-outline" },
  { nome: "outros", icon: "dots-horizontal" },
];

const ABAS = [
  { key: "todos", label: "Todos" },
  { key: "app", label: "MonitoraCult" },
  { key: "mapa", label: "Mapa Cultural" },
];

export default function TelaBusca({ navigation }) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [eventosApp, setEventosApp] = useState([]);
  const [eventosMapa, setEventosMapa] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);
  const [loadingMapa, setLoadingMapa] = useState(true);

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState(null);

  const [abaAtiva, setAbaAtiva] = useState("todos");

  /* MODAL */
  const [modalVisible, setModalVisible] = useState(false);

  /* ────────────────────────────────────────────────────────── */
  /* LOAD APP */
  /* ────────────────────────────────────────────────────────── */

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventosApp();
        setEventosApp(data.map(normalizarApp));
      } catch (e) {
        console.log("Erro eventos app:", e);
      } finally {
        setLoadingApp(false);
      }
    })();
  }, []);

  /* ────────────────────────────────────────────────────────── */
  /* LOAD MAPA */
  /* ────────────────────────────────────────────────────────── */

  useEffect(() => {
    (async () => {
      try {
        const response = await getEventos();

        const lista = Array.isArray(response)
          ? response
          : response?.data || response?.results || [];

        setEventosMapa(lista.map(normalizarMapa));
      } catch (e) {
        console.log("Erro eventos mapa:", e);
      } finally {
        setLoadingMapa(false);
      }
    })();
  }, []);

  /* ────────────────────────────────────────────────────────── */
  /* MERGE */
  /* ────────────────────────────────────────────────────────── */

  const todosMerged = useMemo(() => {
    const titulosApp = new Set(
      eventosApp.map((e) => e.titulo.toLowerCase())
    );

    const mapaFiltrado = eventosMapa.filter(
      (e) => !titulosApp.has(e.titulo.toLowerCase())
    );

    const appOrdenado = [...eventosApp].sort(
      (a, b) => b.score - a.score
    );

    return [...appOrdenado, ...mapaFiltrado];
  }, [eventosApp, eventosMapa]);

  /* ────────────────────────────────────────────────────────── */
  /* FILTROS */
  /* ────────────────────────────────────────────────────────── */

  const eventosFiltrados = useMemo(() => {
    let base = todosMerged;

    if (abaAtiva !== "todos") {
      base = base.filter((e) => e.origem === abaAtiva);
    }

    if (categoriaSelecionada) {
      base = base.filter((e) =>
        e.categoria.includes(categoriaSelecionada)
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();

      base = base.filter(
        (e) =>
          e.titulo.toLowerCase().includes(q) ||
          e.local.toLowerCase().includes(q) ||
          e.categoria.toLowerCase().includes(q)
      );
    }

    return base;
  }, [
    todosMerged,
    abaAtiva,
    categoriaSelecionada,
    query,
  ]);

  const toggleCategoria = useCallback((nome) => {
    setCategoriaSelecionada((prev) =>
      prev === nome ? null : nome
    );
  }, []);

  const loading = loadingApp;

  /* ────────────────────────────────────────────────────────── */
  /* ABRIR EVENTO */
  /* ────────────────────────────────────────────────────────── */

  const abrirEvento = (item) => {
    if (item.origem === "mapa") {
      setModalVisible(true);
      return;
    }

    navigation.navigate("Detalhes", {
      evento: item.original,
    });
  };

  /* ────────────────────────────────────────────────────────── */
  /* CARD */
  /* ────────────────────────────────────────────────────────── */

  const renderCard = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => abrirEvento(item)}
    >
      <Image
        source={{ uri: item.imagem }}
        style={styles.img}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.30)",
          "rgba(0,0,0,0.95)",
        ]}
        style={styles.overlay}
      />

      {/* BADGE */}
      <View
        style={[
          styles.badge,
          item.origem === "app"
            ? styles.badgeApp
            : styles.badgeMapa,
        ]}
      >
        <MaterialCommunityIcons
          name={
            item.origem === "app"
              ? "star"
              : "earth"
          }
          size={11}
          color="#fff"
        />

        <Text style={styles.badgeText}>
          {item.origem === "app"
            ? "MonitoraCult"
            : "Evento Público"}
        </Text>
      </View>

      {/* INFO */}
      <View style={styles.cardInfo}>
        {item.origem === "app" && (
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <MaterialCommunityIcons
                name="heart"
                size={12}
                color={Colors.error}
              />

              <Text style={styles.metricText}>
                {item.likes}
              </Text>
            </View>

            <View style={styles.metric}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={12}
                color="#fff"
              />

              <Text style={styles.metricText}>
                {item.views}
              </Text>
            </View>
          </View>
        )}

        <Text numberOfLines={2} style={styles.titulo}>
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
            size={14}
            color="rgba(255,255,255,0.8)"
          />

          <Text numberOfLines={1} style={styles.local}>
            {item.local}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ────────────────────────────────────────────────────────── */
  /* LINHA */
  /* ────────────────────────────────────────────────────────── */

  const renderLinha = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.linha}
      onPress={() => abrirEvento(item)}
    >
      <Image
        source={{ uri: item.imagem }}
        style={styles.linhaImg}
      />

      <View style={styles.linhaInfo}>
        <Text
          numberOfLines={1}
          style={styles.linhaTitulo}
        >
          {item.titulo}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.linhaLocal}
        >
          📍 {item.local}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.linhaCategoria}
        >
          {item.categoria}
        </Text>
      </View>

      <View
        style={[
          styles.linhaBadge,
          item.origem === "app"
            ? styles.badgeApp
            : styles.badgeMapa,
        ]}
      >
        <MaterialCommunityIcons
          name={
            item.origem === "app"
              ? "star"
              : "earth"
          }
          size={10}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );

  /* ────────────────────────────────────────────────────────── */
  /* RENDER */
  /* ────────────────────────────────────────────────────────── */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#1A1333", Colors.background]}
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

        {/* SEARCH */}
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
            placeholder="Buscar eventos, locais..."
            placeholderTextColor={Colors.textMuted}
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

        {/* ABAS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.abas}
        >
          {ABAS.map((aba) => {
            const ativo = abaAtiva === aba.key;

            return (
              <TouchableOpacity
                key={aba.key}
                style={[
                  styles.aba,
                  ativo && styles.abaAtiva,
                ]}
                onPress={() =>
                  setAbaAtiva(aba.key)
                }
              >
                <Text
                  style={[
                    styles.abaText,
                    ativo &&
                      styles.abaTextAtiva,
                  ]}
                >
                  {aba.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          {/* CATEGORIAS */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>
              Categorias
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CATEGORIAS.map((cat) => {
              const ativo =
                categoriaSelecionada ===
                cat.nome;

              return (
                <TouchableOpacity
                  key={cat.nome}
                  style={[
                    styles.chip,
                    ativo &&
                      styles.chipActive,
                  ]}
                  onPress={() =>
                    toggleCategoria(cat.nome)
                  }
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={16}
                    color={
                      ativo
                        ? Colors.background
                        : Colors.primary
                    }
                  />

                  <Text
                    style={[
                      styles.chipText,
                      ativo &&
                        styles.chipTextActive,
                    ]}
                  >
                    {cat.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* RESULTADOS */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>
              Eventos
            </Text>

            <Text style={styles.count}>
              {eventosFiltrados.length} encontrados
            </Text>
          </View>

          {query ? (
            eventosFiltrados.map((item) =>
              renderLinha(item)
            )
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.cardsRow
              }
            >
              {eventosFiltrados.map((item) =>
                renderCard(item)
              )}
            </ScrollView>
          )}
        </ScrollView>
      )}

      {/* MODAL EVENTO PUBLICO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={60}
            tint="dark"
            style={styles.modalCard}
          >
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons
                name="earth"
                size={36}
                color="#fff"
              />
            </View>

            <Text style={styles.modalTitle}>
              Evento Público
            </Text>

            <Text style={styles.modalText}>
              Procure mais informações no
              site da Secretaria da Cultura
              do Ceará.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() =>
                setModalVisible(false)
              }
            >
              <Text
                style={styles.modalButtonText}
              >
                Entendi
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const CARD_W = SCREEN_WIDTH * 0.72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
    marginRight: 14,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },

  abas: {
    flexDirection: "row",
    gap: 8,
  },

  aba: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },

  abaAtiva: {
    backgroundColor: Colors.primary,
  },

  abaText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  abaTextAtiva: {
    color: "#fff",
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

  count: {
    color: Colors.textMuted,
    fontSize: 12,
  },

  chips: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: "row",
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
  },

  chipActive: {
    backgroundColor: Colors.primary,
  },

  chipText: {
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  chipTextActive: {
    color: Colors.background,
  },

  cardsRow: {
    paddingHorizontal: 16,
    gap: 16,
    flexDirection: "row",
  },

  card: {
    width: CARD_W,
    height: 360,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 5,
  },

  badgeApp: {
    backgroundColor: Colors.primary + "DD",
  },

  badgeMapa: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  cardInfo: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 18,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metricText: {
    color: "#fff",
    fontSize: 12,
  },

  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },

  descricao: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  local: {
    color: "rgba(255,255,255,0.85)",
    marginLeft: 4,
    flex: 1,
    fontSize: 13,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  linhaImg: {
    width: 78,
    height: 78,
  },

  linhaInfo: {
    flex: 1,
    padding: 12,
  },

  linhaTitulo: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  linhaLocal: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },

  linhaCategoria: {
    color: Colors.textMuted,
    marginTop: 3,
    fontSize: 11,
    textTransform: "capitalize",
  },

  linhaBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.70)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor:
      "rgba(25,25,35,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  modalIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    marginBottom: 20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalText: {
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 15,
  },

  modalButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 18,
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});