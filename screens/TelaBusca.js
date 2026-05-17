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
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventosApp } from "../services/eventosAppService";
import { getEventos } from "../services/mapaCulturalService";
import { Colors } from "../styles/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Normaliza eventos do MonitoraCult (Firestore) ───────────────────────────
function normalizarApp(item) {
  return {
    id: `app_${item.id}`,
    titulo: item.tituloEvento || item.name || "Evento",
    imagem:
      item.imagemEvento ||
      item.files?.header?.url ||
      "https://placehold.co/600x400?text=Evento",
    local: item.localEvento || item.nomeLocal || item.location?.name || "Local não informado",
    categoria: (item.categoria || item.tipoEvento || "outros").toLowerCase(),
    descricao: item.descricao || item.shortDescription || "Evento cadastrado no MonitoraCult",
    score: item.score || 0,
    likes: item.likes || 0,
    views: item.views || 0,
    origem: "app",        // ← distingue a fonte
    original: item,
  };
}

// ─── Normaliza eventos do Mapa Cultural (API externa) ────────────────────────
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
    descricao: item?.shortDescription || "Evento do Mapa Cultural do Ceará",
    score: 0,
    likes: 0,
    views: 0,
    origem: "mapa",
    original: item,
  };
}

/* ─── CATEGORIAS FIXAS ───────────────────────────────────────────────────── */
const CATEGORIAS = [
  { nome: "teatro",      icon: "drama-masks" },
  { nome: "shows",       icon: "music" },
  { nome: "cinema",      icon: "movie" },
  { nome: "exposição",   icon: "image-frame" },
  { nome: "dança",       icon: "human" },
  { nome: "gastronomia", icon: "silverware-fork-knife" },
  { nome: "infantil",    icon: "baby-face-outline" },
  { nome: "outros",      icon: "dots-horizontal" },
];

/* ─── ABAS DE FONTE ──────────────────────────────────────────────────────── */
const ABAS = [
  { key: "todos",    label: "Todos" },
  { key: "app",     label: "MonitoraCult" },
  { key: "mapa",    label: "Mapa Cultural" },
];

export default function TelaBusca({ navigation }) {
  const insets = useSafeAreaInsets();

  const [query, setQuery]                       = useState("");
  const [eventosApp, setEventosApp]             = useState([]);
  const [eventosMapa, setEventosMapa]           = useState([]);
  const [loadingApp, setLoadingApp]             = useState(true);
  const [loadingMapa, setLoadingMapa]           = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [abaAtiva, setAbaAtiva]                 = useState("todos");

  // ── Carrega eventos do MonitoraCult primeiro (prioridade) ─────────────────
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

  // ── Carrega Mapa Cultural em paralelo (sem bloquear a UI) ─────────────────
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

  // ── Merge: app primeiro, depois mapa (sem duplicatas por título) ──────────
  const todosMerged = useMemo(() => {
    const titulosApp = new Set(eventosApp.map((e) => e.titulo.toLowerCase()));

    const mapaFiltrado = eventosMapa.filter(
      (e) => !titulosApp.has(e.titulo.toLowerCase())
    );

    // Ordena app por score desc, mapa sem score fica no fim
    const appOrdenado = [...eventosApp].sort((a, b) => b.score - a.score);

    return [...appOrdenado, ...mapaFiltrado];
  }, [eventosApp, eventosMapa]);

  // ── Filtragem por aba + categoria + texto ─────────────────────────────────
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
  }, [todosMerged, abaAtiva, categoriaSelecionada, query]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleCategoria = useCallback((nome) => {
    setCategoriaSelecionada((prev) => (prev === nome ? null : nome));
  }, []);

  const loading = loadingApp; // UI aparece assim que o app carrega

  // ── Render: Card ──────────────────────────────────────────────────────────
  const renderCard = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate("Detalhes", { evento: item.original })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.img} />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.overlay}
      />

      {/* Badge de origem */}
      <View
        style={[
          styles.badge,
          item.origem === "app" ? styles.badgeApp : styles.badgeMapa,
        ]}
      >
        <MaterialCommunityIcons
          name={item.origem === "app" ? "star" : "map-marker"}
          size={11}
          color="#fff"
        />
        <Text style={styles.badgeText}>
          {item.origem === "app" ? "MonitoraCult" : "Mapa Cultural"}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        {/* Métricas (apenas eventos do app têm) */}
        {item.origem === "app" && (
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="heart" size={12} color={Colors.error} />
              <Text style={styles.metricText}>{item.likes}</Text>
            </View>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="eye-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metricText}>{item.views}</Text>
            </View>
          </View>
        )}

        <Text numberOfLines={2} style={styles.titulo}>
          {item.titulo}
        </Text>

        <Text numberOfLines={1} style={styles.descricao}>
          {item.descricao}
        </Text>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.7)" />
          <Text numberOfLines={1} style={styles.local}>
            {item.local}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Render: Linha compacta (mapa cultural em busca textual) ───────────────
  const renderLinha = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.85}
      style={styles.linha}
      onPress={() =>
        navigation.navigate("Detalhes", { evento: item.original })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.linhaImg} />
      <View style={styles.linhaInfo}>
        <Text numberOfLines={1} style={styles.linhaTitulo}>
          {item.titulo}
        </Text>
        <Text numberOfLines={1} style={styles.linhaLocal}>
          📍 {item.local}
        </Text>
        <Text numberOfLines={1} style={styles.linhaCategoria}>
          {item.categoria}
        </Text>
      </View>
      <View
        style={[
          styles.linhaBadge,
          item.origem === "app" ? styles.badgeApp : styles.badgeMapa,
        ]}
      >
        <MaterialCommunityIcons
          name={item.origem === "app" ? "star" : "map-marker"}
          size={10}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#1A1333", Colors.background]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Explorar Eventos</Text>
            <Text style={styles.headerSub}>
              Descubra experiências incríveis ✨
            </Text>
          </View>
        </View>

        {/* Campo de busca */}
        <BlurView
          intensity={40}
          tint="dark"
          style={styles.searchBox}
        >
          <MaterialCommunityIcons name="magnify" size={22} color={Colors.textMuted} />
          <TextInput
            placeholder="Buscar eventos, locais..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </BlurView>

        {/* Abas de fonte */}
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
                style={[styles.aba, ativo && styles.abaAtiva]}
                onPress={() => setAbaAtiva(aba.key)}
              >
                {aba.key === "app" && (
                  <MaterialCommunityIcons
                    name="star"
                    size={13}
                    color={ativo ? Colors.background : Colors.primary}
                    style={{ marginRight: 5 }}
                  />
                )}
                <Text style={[styles.abaText, ativo && styles.abaTextAtiva]}>
                  {aba.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* ── CONTEÚDO ──────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── CATEGORIAS ────────────────────────────────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Categorias</Text>
            {categoriaSelecionada && (
              <TouchableOpacity onPress={() => setCategoriaSelecionada(null)}>
                <Text style={styles.clearText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CATEGORIAS.map((cat) => {
              const ativo = categoriaSelecionada === cat.nome;
              return (
                <TouchableOpacity
                  key={cat.nome}
                  activeOpacity={0.8}
                  style={[styles.chip, ativo && styles.chipActive]}
                  onPress={() => toggleCategoria(cat.nome)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={17}
                    color={ativo ? Colors.background : Colors.primary}
                  />
                  <Text style={[styles.chipText, ativo && styles.chipTextActive]}>
                    {cat.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── DESTAQUE: Eventos do MonitoraCult (se aba não filtrar) ──── */}
          {abaAtiva !== "mapa" && !query && !categoriaSelecionada && (
            <>
              <View style={styles.sectionRow}>
                <View style={styles.sectionLabelRow}>
                  <MaterialCommunityIcons name="star" size={16} color={Colors.primary} />
                  <Text style={[styles.section, { marginLeft: 6 }]}>
                    MonitoraCult
                  </Text>
                </View>
                <Text style={styles.count}>{eventosApp.length} eventos</Text>
              </View>

              {eventosApp.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.empty}>Nenhum evento cadastrado ainda.</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {eventosApp.map((item) => renderCard(item))}
                </ScrollView>
              )}

              {/* ── Mapa Cultural como seção secundária ─────────────────── */}
              {abaAtiva !== "app" && (
                <>
                  <View style={styles.sectionRow}>
                    <View style={styles.sectionLabelRow}>
                      <MaterialCommunityIcons name="map-marker" size={16} color={Colors.textSecondary} />
                      <Text style={[styles.section, { marginLeft: 6 }]}>
                        Mapa Cultural
                      </Text>
                    </View>
                    {loadingMapa ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Text style={styles.count}>{eventosMapa.length} eventos</Text>
                    )}
                  </View>

                  {!loadingMapa && eventosMapa.length === 0 && (
                    <Text style={[styles.empty, { paddingHorizontal: 16 }]}>
                      Mapa Cultural indisponível no momento.
                    </Text>
                  )}

                  {!loadingMapa &&
                    eventosMapa.slice(0, 6).map((item) => renderLinha(item))}
                </>
              )}
            </>
          )}

          {/* ── RESULTADOS DE BUSCA / FILTRO / ABA ──────────────────────── */}
          {(query || categoriaSelecionada || abaAtiva !== "todos") && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>Resultados</Text>
                <Text style={styles.count}>
                  {eventosFiltrados.length} encontrados
                </Text>
              </View>

              {eventosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="emoticon-sad-outline"
                    size={56}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.empty}>Nenhum evento encontrado</Text>
                  {abaAtiva === "app" && (
                    <TouchableOpacity
                      style={styles.switchAbaBtn}
                      onPress={() => setAbaAtiva("todos")}
                    >
                      <Text style={styles.switchAbaText}>
                        Ver também no Mapa Cultural
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : query ? (
                // Busca textual → lista vertical (mais fácil de ler)
                eventosFiltrados.map((item) => renderLinha(item))
              ) : (
                // Filtro por aba/categoria → cards horizontais
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {eventosFiltrados.map((item) => renderCard(item))}
                </ScrollView>
              )}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const CARD_W = SCREEN_WIDTH * 0.72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* HEADER */
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: "800",
  },
  headerSub: {
    color: Colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },

  /* BUSCA */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },

  /* ABAS */
  abas: {
    paddingRight: 8,
    gap: 8,
    flexDirection: "row",
  },
  aba: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  abaAtiva: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  abaText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  abaTextAtiva: {
    color: "#fff",
  },

  /* SEÇÕES */
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  count: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  /* CHIPS */
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: Colors.background,
  },

  /* CARDS HORIZONTAIS */
  cardsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 14,
    flexDirection: "row",
  },
  card: {
    width: CARD_W,
    height: 340,
    borderRadius: 24,
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

  /* BADGE DE ORIGEM */
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    gap: 5,
  },
  badgeApp: {
    backgroundColor: Colors.primary + "CC",
  },
  badgeMapa: {
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  /* CARD INFO */
  cardInfo: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
  titulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  descricao: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  local: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 13,
    flex: 1,
  },

  /* LINHAS (busca textual / mapa secundário) */
  linha: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linhaImg: {
    width: 72,
    height: 72,
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
    fontSize: 12,
    marginTop: 3,
  },
  linhaCategoria: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "capitalize",
  },
  linhaBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  /* LOADING / EMPTY */
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
    paddingHorizontal: 32,
  },
  empty: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
  },
  switchAbaBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  switchAbaText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});