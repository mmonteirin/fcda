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
  Linking,
  Modal,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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

const DEFAULT_IMAGE =
  "https://placehold.co/600x400?text=Evento";

export default function TelaInicio() {
  const navigation = useNavigation();

  const { user, nome } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [location, setLocation] = useState(null);

  const [likedIds, setLikedIds] = useState([]);

  const [showMapErrorModal, setShowMapErrorModal] =
    useState(false);

  const [mapErrorMessage, setMapErrorMessage] =
    useState("");

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
      console.log(error);
    }
  };

  const carregarEventos = async () => {
    try {
      const data = await getEventosApp();

      const tratados = data.map((item) => ({
        id: item.id,

        titulo:
          item.tituloEvento ||
          item.name ||
          "Evento",

        imagem:
          item.imagemEvento ||
          item.files?.header?.url ||
          DEFAULT_IMAGE,

        local:
          item.localEvento ||
          item.nomeLocal ||
          item.location?.name ||
          "Local",

        categoria:
          item.categoria ||
          item.tipoEvento ||
          "Outros",

        latitude: item.latitude ?? null,

        longitude: item.longitude ?? null,

        likes: item.likes || 0,

        views: item.views || 0,

        score: item.score || 0,

        original: item,
      }));

      const usuario = await getUserLocation();

      if (usuario) {
        setLocation(usuario);
      }

      setEventos(tratados);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const eventosComDistancia = useMemo(() => {
    return eventos.map((item) => ({
      ...item,

      distancia:
        location &&
        item.latitude != null &&
        item.longitude != null
          ? calcularDistancia(
              location.latitude,
              location.longitude,
              item.latitude,
              item.longitude
            )
          : null,
    }));
  }, [eventos, location]);

  const categorias = useMemo(() => {
    const valores = eventos
      .map((item) => item.categoria || "Outros")
      .filter(Boolean);

    return ["Todos", ...new Set(valores)];
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    if (categoriaAtiva === "Todos") {
      return eventosComDistancia;
    }

    return eventosComDistancia.filter((evento) =>
      evento.categoria
        .toLowerCase()
        .includes(categoriaAtiva.toLowerCase())
    );
  }, [categoriaAtiva, eventosComDistancia]);

  const destaques = useMemo(() => {
    return eventosFiltrados
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [eventosFiltrados]);

  const proximos = useMemo(() => {
    return eventosFiltrados
      .filter(
        (item) =>
          typeof item.distancia === "number"
      )
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 6);
  }, [eventosFiltrados]);

  const abrirMapa = async () => {
    try {
      if (!location) {
        setMapErrorMessage(
          "Sua localização ainda não foi carregada."
        );

        setShowMapErrorModal(true);

        return;
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        setMapErrorMessage(
          "Não foi possível abrir o aplicativo de mapas neste dispositivo."
        );

        setShowMapErrorModal(true);

        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      setMapErrorMessage(
        "Verifique sua conexão, permissões de localização ou tente novamente em alguns instantes."
      );

      setShowMapErrorModal(true);
    }
  };

  const formatarDistancia = (distancia) => {
    if (distancia == null)
      return "Localização indisponível";

    if (distancia < 1) {
      return `${Math.round(
        distancia * 1000
      )} m`;
    }

    return `${distancia.toFixed(1)} km`;
  };

  const HeroCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.heroCard}
      onPress={() =>
        navigation.navigate("Detalhes", {
          evento: item.original,
        })
      }
    >
      <Image
        source={{ uri: item.imagem }}
        style={styles.heroImage}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.95)",
        ]}
        style={styles.heroGradient}
      />

      <View style={styles.heroContent}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>
            {item.categoria}
          </Text>
        </View>

        <Text
          style={styles.heroTitle}
          numberOfLines={2}
        >
          {item.titulo}
        </Text>

        <Text
          style={styles.heroLocation}
          numberOfLines={1}
        >
          📍 {item.local}
        </Text>

        <View style={styles.heroFooter}>
          <View style={styles.metric}>
            <MaterialCommunityIcons
              name="heart"
              size={14}
              color="#FF4D6D"
            />

            <Text style={styles.metricText}>
              {item.likes}
            </Text>
          </View>

          <View style={styles.metric}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={15}
              color="#FFF"
            />

            <Text style={styles.metricText}>
              {item.views}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CardEvento = ({ item }) => (
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
        style={styles.cardImage}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.85)",
        ]}
        style={styles.cardGradient}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.categoryMini}>
            <Text style={styles.categoryMiniText}>
              {item.categoria}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.likeButton}
          >
            <MaterialCommunityIcons
              name={
                likedIds.includes(item.id)
                  ? "heart"
                  : "heart-outline"
              }
              size={18}
              color={
                likedIds.includes(item.id)
                  ? "#FF4D6D"
                  : "#FFF"
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBottom}>
          <Text
            style={styles.cardTitle}
            numberOfLines={2}
          >
            {item.titulo}
          </Text>

          <Text
            style={styles.cardLocation}
            numberOfLines={1}
          >
            📍 {item.local}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.distance}>
              {formatarDistancia(
                item.distancia
              )}
            </Text>

            <View style={styles.rating}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color="#FFD166"
              />

              <Text style={styles.ratingText}>
                {Math.round(item.score)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={[
            "#10131F",
            Colors.background,
          ]}
          style={styles.header}
        >
          <View>
            <Text style={styles.saudacao}>
              Olá 👋
            </Text>

            <Text style={styles.nome}>
              {nomeUsuario}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* BUSCA */}
        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate("Busca")
          }
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={Colors.textSecondary}
          />

          <Text style={styles.searchText}>
            Buscar eventos, shows...
          </Text>
        </TouchableOpacity>

        {/* DESTAQUES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Destaques
          </Text>

          <Text style={styles.sectionSub}>
            Eventos em alta agora
          </Text>
        </View>

        <FlashList
          data={destaques}
          renderItem={({ item }) => (
            <HeroCard item={item} />
          )}
          keyExtractor={(item) =>
            item.id.toString()
          }
          horizontal
          estimatedItemSize={300}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
        />

        {/* CATEGORIAS */}
        <FlashList
          data={categorias}
          horizontal
          estimatedItemSize={100}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 10,
          }}
          renderItem={({ item }) => {
            const ativo =
              item === categoriaAtiva;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  setCategoriaAtiva(item)
                }
                style={[
                  styles.categoryBtn,
                  ativo &&
                    styles.categoryBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    ativo &&
                      styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* PROXIMOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Próximos de você
          </Text>

          <Text style={styles.sectionSub}>
            Baseado na sua localização
          </Text>
        </View>

        <FlashList
          data={proximos}
          renderItem={({ item }) => (
            <CardEvento item={item} />
          )}
          keyExtractor={(item) =>
            item.id.toString()
          }
          estimatedItemSize={260}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
        />

        {/* MAPA */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={abrirMapa}
          style={styles.mapCard}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
            }}
            style={styles.mapImage}
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.92)",
            ]}
            style={styles.mapGradient}
          />

          <View style={styles.mapContent}>
            <View style={styles.mapIcon}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={22}
                color="#FFF"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>
                Explorar no mapa
              </Text>

              <Text style={styles.mapText}>
                Veja eventos próximos à sua
                localização em tempo real
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={26}
              color="#FFF"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={showMapErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMapErrorModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={70}
            tint="dark"
            style={styles.modalCard}
          >
            <LinearGradient
              colors={[
                Colors.primary,
                "#7B5CFF",
              ]}
              style={styles.modalIcon}
            >
              <MaterialCommunityIcons
                name="map-marker-off"
                size={34}
                color="#FFF"
              />
            </LinearGradient>

            <Text style={styles.modalTitle}>
              Não foi possível abrir o mapa
            </Text>

            <Text style={styles.modalMessage}>
              {mapErrorMessage}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setShowMapErrorModal(false)
              }
              style={{ width: "100%" }}
            >
              <LinearGradient
                colors={[
                  Colors.primary,
                  "#7B5CFF",
                ]}
                style={styles.modalButton}
              >
                <Text
                  style={
                    styles.modalButtonText
                  }
                >
                  Entendi
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saudacao: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  nome: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },

  notificationBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  searchText: {
    color: Colors.textSecondary,
    marginLeft: 10,
    fontSize: 14,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 8,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  sectionSub: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },

  heroCard: {
    width: windowWidth * 0.78,
    height: 260,
    marginRight: 16,
    borderRadius: 28,
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroContent: {
    position: "absolute",
    bottom: 18,
    left: 18,
    right: 18,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  heroBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  heroTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },

  heroLocation: {
    color: "rgba(255,255,255,0.75)",
    marginBottom: 14,
  },

  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metricText: {
    color: "#FFF",
    fontSize: 12,
  },

  categoryBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 10,
  },

  categoryBtnActive: {
    backgroundColor: Colors.primary,
  },

  categoryText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: "#FFF",
  },

  card: {
    height: 260,
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: Colors.surface,
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  cardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 18,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  categoryMini: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },

  categoryMiniText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  likeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardBottom: {},

  cardTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardLocation: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    marginBottom: 14,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  distance: {
    color: "#FFF",
    fontWeight: "600",
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  ratingText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },

  mapCard: {
    height: 220,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 28,
    overflow: "hidden",
  },

  mapImage: {
    width: "100%",
    height: "100%",
  },

  mapGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  mapContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  mapIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  mapTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  mapText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(20,20,30,0.85)",
  },

  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  modalMessage: {
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },

  modalButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});