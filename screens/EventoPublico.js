import React, { useEffect, useState } from "react";

import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventos } from "../services/mapaCulturalService";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

export default function EventoPublico({ navigation }) {
  const insets = useSafeAreaInsets();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* MODAL */
  const [modalVisible, setModalVisible] =
    useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const response = await getEventos();

      const lista = Array.isArray(response)
        ? response
        : response?.data ||
          response?.results ||
          [];

      const tratados = lista.map(
        (item, index) => {
          const imagem =
            item?.image?.url ||
            item?.files?.header?.url ||
            null;

          return {
            id: item.id || index,

            titulo:
              item.name || "Evento",

            imagem,

            possuiImagem: !!imagem,

            local:
              item?.location?.name ||
              "Local não informado",

            descricao:
              item?.shortDescription ||
              item?.description ||
              "Descubra mais detalhes sobre este evento.",

            original: item,
          };
        }
      );

      setEventos(tratados);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const abrirEvento = () => {
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={abrirEvento}
    >
      {/* IMAGEM OU FALLBACK */}
      {item.possuiImagem ? (
        <Image
          source={{ uri: item.imagem }}
          style={styles.img}
        />
      ) : (
        <ImageBackground
          source={require("../assets/fundoTelaLogin.png")}
          style={styles.img}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.55)",
              "rgba(0,0,0,0.80)",
            ]}
            style={styles.noImageOverlay}
          >
            <MaterialCommunityIcons
              name="image-off-outline"
              size={42}
              color="#FFF"
            />

            <Text style={styles.noImageText}>
              Imagem não disponível
            </Text>
          </LinearGradient>
        </ImageBackground>
      )}

      {/* OVERLAY */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.96)",
        ]}
        style={styles.overlay}
      />

      {/* BADGE */}
      <View style={styles.badge}>
        <MaterialCommunityIcons
          name="earth"
          size={14}
          color="#FFF"
        />

        <Text style={styles.badgeText}>
          Evento Público
        </Text>
      </View>

      {/* INFO */}
      <View style={styles.info}>
        <Text
          style={styles.titulo}
          numberOfLines={2}
        >
          {item.titulo}
        </Text>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={15}
            color="#DDD"
          />

          <Text
            style={styles.local}
            numberOfLines={1}
          >
            {item.local}
          </Text>
        </View>

        <Text
          style={styles.descricao}
          numberOfLines={2}
        >
          {item.descricao}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Carregando eventos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={[
          "#111827",
          "#1E293B",
          "#0F172A",
        ]}
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Eventos Públicos
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Explore eventos culturais e
            experiências
          </Text>
        </View>
      </LinearGradient>

      {/* LISTA */}
      <FlatList
        data={eventos}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={
          false
        }
      />

      {/* MODAL */}
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
                size={38}
                color="#FFF"
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
                style={
                  styles.modalButtonText
                }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },

  /* HEADER */
  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,

    flexDirection: "row",
    alignItems: "center",

    gap: 14,

    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(255,255,255,0.05)",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color:
      "rgba(255,255,255,0.65)",
    marginTop: 3,
    fontSize: 13,
  },

  /* LIST */
  list: {
    padding: 16,
    paddingBottom: 40,
  },

  /* CARD */
  card: {
    height: 250,

    borderRadius: 28,

    marginBottom: 22,

    overflow: "hidden",

    backgroundColor: "#111827",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.35,
    shadowRadius: 20,

    elevation: 12,
  },

  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  noImageOverlay: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    gap: 10,
  },

  noImageText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  overlay: {
    position: "absolute",

    bottom: 0,

    height: "100%",
    width: "100%",
  },

  /* BADGE */
  badge: {
    position: "absolute",
    top: 16,
    left: 16,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 30,

    backgroundColor:
      "rgba(0,0,0,0.50)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
  },

  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* INFO */
  info: {
    position: "absolute",
    bottom: 0,

    padding: 20,

    width: "100%",
  },

  titulo: {
    color: "#FFF",

    fontWeight: "800",

    fontSize: 23,

    marginBottom: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    marginBottom: 8,
  },

  local: {
    color: "#DDD",
    fontSize: 13,
    flex: 1,
  },

  descricao: {
    color:
      "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 20,
  },

  /* LOADING */
  loading: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#0B1120",
  },

  loadingText: {
    marginTop: 16,
    color: "#AAA",
    fontSize: 14,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.70)",

    justifyContent: "center",
    alignItems: "center",

    padding: 24,
  },

  modalCard: {
    width: "100%",

    borderRadius: 30,

    padding: 28,

    alignItems: "center",

    overflow: "hidden",

    backgroundColor:
      "rgba(20,20,30,0.88)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.06)",
  },

  modalIcon: {
    width: 82,
    height: 82,

    borderRadius: 41,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      colors.primary,

    marginBottom: 22,
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalText: {
    color:
      "rgba(255,255,255,0.75)",

    textAlign: "center",

    lineHeight: 24,

    fontSize: 15,
  },

  modalButton: {
    marginTop: 24,

    backgroundColor:
      colors.primary,

    paddingHorizontal: 34,
    paddingVertical: 14,

    borderRadius: 18,
  },

  modalButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});