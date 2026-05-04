import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventos } from "../services/mapaCulturalService";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

export default function EventoPublico({ navigation }) {
  const insets = useSafeAreaInsets();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
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
          item?.image?.url ||
          item?.files?.header?.url ||
          "https://placehold.co/400x200",
        local: item?.location?.name || "Local",
        original: item,
      }));

      setEventos(tratados);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("EventoPublico", {
          evento: item.original,
        })
      }
    >
      <Image source={{ uri: item.imagem }} style={styles.img} />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.overlay}
      />

      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.local}>📍 {item.local}</Text>
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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryDark, colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Eventos Públicos</Text>
      </LinearGradient>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    height: "100%",
    width: "100%",
  },

  info: {
    position: "absolute",
    bottom: 0,
    padding: 16,
  },

  titulo: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  local: {
    color: "#ccc",
    fontSize: 12,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
