import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";

import { getUserLocation } from "../services/locationService";
import { calcularDistancia } from "../utils/distance";
import {
  getEventosApp,
  getUserLikes,
} from "../services/eventosAppService";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

const windowWidth = Dimensions.get("window").width;
const DEFAULT_IMAGE = "https://placehold.co/600x400?text=Evento";

export default function TelaInicio() {
  const navigation = useNavigation();
  const { user, nome } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [likedIds, setLikedIds] = useState([]);

  const nomeUsuario =
    nome ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Explorador";

  useEffect(() => {
    carregarEventos();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      carregarLikes();
    }
  }, [user?.uid]);

  const carregarLikes = async () => {
    try {
      const ids = await getUserLikes(user.uid);
      setLikedIds(ids);
    } catch (error) {
      console.log("Erro ao carregar likes:", error);
    }
  };

  const carregarEventos = async () => {
    try {
      const data = await getEventosApp();
      const tratados = data.map((item) => ({
        id: item.id,
        titulo: item.tituloEvento || item.name || "Evento",
        imagem: item.imagemEvento || item.files?.header?.url || DEFAULT_IMAGE,
        local:
          item.localEvento || item.nomeLocal || item.location?.name || "Local",
        categoria: item.categoria || item.tipoEvento || "Outros",
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        likes: item.likes || 0,
        views: item.views || 0,
        comentarios: item.comentarios || 0,
        score: item.score || 0,
        original: item,
      }));

      const usuario = await getUserLocation();
      if (usuario) {
        setLocation(usuario);
      } else {
        setLocationError("Permissão de localização negada ou localização indisponível.");
      }

      setEventos(tratados);
    } catch (error) {
      console.log("Erro ao carregar eventos:", error);
      Alert.alert("Erro", "Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  };

  const formatarDistancia = (distancia) => {
    if (distancia == null) return "Localização indisponível";
    if (distancia < 1) {
      return `${Math.round(distancia * 1000)} m`;
    }
    return `${distancia.toFixed(1)} km`;
  };

  const eventosComDistancia = useMemo(
    () =>
      eventos.map((item) => ({
        ...item,
        distancia:
          location && item.latitude != null && item.longitude != null
            ? calcularDistancia(
                location.latitude,
                location.longitude,
                item.latitude,
                item.longitude
              )
            : null,
      })),
    [eventos, location]
  );

  const categorias = useMemo(() => {
    const valores = eventos
      .map((item) => item.categoria || "Outros")
      .filter(Boolean);

    return ["Todos", ...new Set(valores)];
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    if (categoriaAtiva === "Todos") return eventosComDistancia;

    return eventosComDistancia.filter((evento) =>
      evento.categoria
        .toLowerCase()
        .includes(categoriaAtiva.toLowerCase())
    );
  }, [categoriaAtiva, eventosComDistancia]);

  const destaques = useMemo(
    () =>
      eventosFiltrados
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, 8),
    [eventosFiltrados]
  );

  const proximos = useMemo(
    () =>
      eventosFiltrados
        .filter((item) => typeof item.distancia === "number")
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, 6),
    [eventosFiltrados]
  );

  const recomendados = useMemo(
    () =>
      eventosFiltrados
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, 6),
    [eventosFiltrados]
  );

  const estaCurtir = (eventoId) => likedIds.includes(eventoId);

  const HeroCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.heroCard}
      onPress={() => navigation.navigate("Detalhes", { evento: item.original })}
    >
      <Image source={{ uri: item.imagem }} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <View style={styles.heroInfo}>
        <Text style={styles.heroTag}>{item.categoria}</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <MaterialCommunityIcons
              name="heart"
              size={16}
              color={Colors.error}
            />
            <Text style={styles.heroMetricText}>{item.likes || 0}</Text>
          </View>
          <View style={styles.heroMetric}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.heroMetricText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CardHorizontal = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardHorizontal}
      onPress={() => navigation.navigate("Detalhes", { evento: item.original })}
    >
      <Image source={{ uri: item.imagem }} style={styles.imgHorizontal} />
      <Text style={styles.titleCard} numberOfLines={2}>
        {item.titulo}
      </Text>
      <Text style={styles.localCard}>📍 {item.local}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>{formatarDistancia(item.distancia)}</Text>
        <Text style={styles.footerLabel}>⭐ {Math.round(item.score)}</Text>
      </View>
    </TouchableOpacity>
  );

  const CardVertical = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardVertical}
      onPress={() => navigation.navigate("Detalhes", { evento: item.original })}
    >
      <Image source={{ uri: item.imagem }} style={styles.imgVertical} />
      <View style={styles.cardVerticalContent}>
        <Text style={styles.titleCard} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.localCard}>📍 {item.local}</Text>
        <View style={styles.cardFooterRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name={estaCurtir(item.id) ? "heart" : "heart-outline"}
              size={14}
              color={estaCurtir(item.id) ? Colors.error : Colors.textSecondary}
            />
            <Text style={styles.badgeText}>{item.likes || 0}</Text>
          </View>
          <Text style={styles.smallText}>{formatarDistancia(item.distancia)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá,</Text>
          <Text style={styles.nome}>{nomeUsuario}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => navigation.navigate("Busca")}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={Colors.textSecondary}
        />
        <Text style={styles.searchText}>
          Buscar eventos, shows, teatros...
        </Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Para você</Text>
        <Text style={styles.sectionHint}>Baseado em likes, views e relevância</Text>
      </View>

      <FlashList
        data={destaques}
        renderItem={({ item }) => <HeroCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={250}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      <View style={styles.categoryWrapper}>
        <FlashList
          data={categorias}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const ativo = item === categoriaAtiva;
            return (
              <TouchableOpacity
                onPress={() => setCategoriaAtiva(item)}
                style={[
                  styles.categoria,
                  {
                    backgroundColor: ativo ? Colors.primary : Colors.surface,
                  },
                ]}
              >
                <Text
                  style={{
                    color: ativo ? Colors.background : Colors.textSecondary,
                    fontWeight: ativo ? "bold" : "normal",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={120}
          contentContainerStyle={styles.categorias}
        />
      </View>

      <Text style={styles.section}>Próximos de você</Text>
      {proximos.length > 0 ? (
        <FlashList
          data={proximos}
          renderItem={({ item }) => <CardVertical item={item} />}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={220}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      ) : (
        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyStateText}>
            {locationError
              ? locationError
              : "Nenhum evento com coordenadas disponíveis."}
          </Text>
        </View>
      )}

      <Text style={styles.section}>Recomendados</Text>
      {recomendados.length > 0 ? (
        <FlashList
          data={recomendados}
          renderItem={({ item }) => <CardHorizontal item={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.empty}>Nenhum evento encontrado.</Text>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saudacao: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  nome: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "bold",
  },
  iconBtn: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  searchBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  searchText: {
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  section: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  categoryWrapper: {
    paddingBottom: 10,
  },
  categorias: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  categoria: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
  },
  heroCard: {
    width: windowWidth * 0.78,
    height: 220,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTag: {
    color: Colors.background,
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "bold",
  },
  heroTitle: {
    color: Colors.background,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  heroMetrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetricText: {
    color: Colors.background,
    fontSize: 12,
  },
  cardHorizontal: {
    width: 160,
    marginRight: 12,
  },
  imgHorizontal: {
    width: "100%",
    height: 110,
    borderRadius: 16,
  },
  cardVertical: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  imgVertical: {
    width: "100%",
    height: 170,
  },
  cardVerticalContent: {
    padding: 14,
  },
  titleCard: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
  },
  localCard: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: 12,
  },
  smallText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyStateBox: {
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    textAlign: "center",
  },
  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
