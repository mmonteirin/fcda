import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Modal,
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

  const [modalFiltro, setModalFiltro] = useState(false);
  const [categoria, setCategoria] = useState(null);
  const [tipo, setTipo] = useState(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
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
      tipoEvento: item?.gratis ? "Gratuito" : "Pago",
      original: item,
    }));

    setEventos(tratados);
  };

  const filtrar = (lista) => {
    return lista.filter((item) => {
      const matchQuery =
        item.titulo.toLowerCase().includes(query.toLowerCase()) ||
        item.local.toLowerCase().includes(query.toLowerCase());

      const matchCategoria = categoria
        ? item.categoria?.toLowerCase().includes(categoria.toLowerCase())
        : true;

      const matchTipo = tipo
        ? item.tipoEvento?.toLowerCase() === tipo.toLowerCase()
        : true;

      return matchQuery && matchCategoria && matchTipo;
    });
  };

  const eventosFiltrados = filtrar(eventos);

  const renderHorizontal = (lista) => (
    <FlatList
      horizontal
      data={lista}
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("Detalhes", { evento: item.original })
          }
        >
          <Image source={{ uri: item.imagem }} style={styles.img} />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.overlay}
          >
            <Text style={styles.titulo} numberOfLines={2}>
              {item.titulo}
            </Text>

            <Text style={styles.local}>📍 {item.local}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
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
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Inicio");
              }
            }}
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

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={Colors.primary}
            />

            <TextInput
              placeholder="O que você quer encontrar?"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={styles.input}
            />

            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalFiltro(true)}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView>
        {query.length > 0 && eventosFiltrados.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={50}
              color={Colors.textMuted}
            />
            <Text style={{ color: Colors.textMuted, marginTop: 10 }}>
              Nenhum evento encontrado
            </Text>
          </View>
        )}

        {query.length > 0 ? (
          <>
            <Text style={styles.section}>Resultados</Text>
            {renderHorizontal(eventosFiltrados)}
          </>
        ) : (
          <>
            <Text style={styles.section}>🔥 Destaques</Text>
            {renderHorizontal(eventos.slice(0, 6))}

            <Text style={styles.section}>🎭 Eventos</Text>
            {renderHorizontal(eventos)}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 🔥 MODAL */}
      <Modal visible={modalFiltro} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filtrar Eventos</Text>

            <Text style={styles.modalLabel}>Categoria</Text>
            <View style={styles.chipsRow}>
              {["Teatro", "Shows", "Cinema", "Gastronomia"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    setCategoria(categoria === item ? null : item)
                  }
                  style={[
                    styles.chip,
                    categoria === item && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      categoria === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Tipo</Text>
            <View style={styles.chipsRow}>
              {["Gratuito", "Pago"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTipo(tipo === item ? null : item)}
                  style={[
                    styles.chip,
                    tipo === item && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tipo === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setCategoria(null);
                  setTipo(null);
                  setModalFiltro(false);
                }}
              >
                <Text style={styles.clear}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.apply}
                onPress={() => setModalFiltro(false)}
              >
                <Text style={styles.applyText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 10,
    marginLeft: 8,
  },

  filterButton: {
    marginLeft: 10,
    height: 48,
    width: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  section: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
    fontWeight: "bold",
  },

  card: {
    width: 140,
    height: 170,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.card,
    marginRight: 10,
  },

  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
  },

  titulo: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },

  local: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  modalLabel: {
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 8,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },

  chipActive: {
    backgroundColor: Colors.primary,
  },

  chipText: {
    color: Colors.textSecondary,
  },

  chipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  clear: {
    color: Colors.textMuted,
  },

  apply: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
