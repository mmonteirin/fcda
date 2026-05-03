import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

export default function EventoPublico({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [abrirWeb, setAbrirWeb] = useState(false);

  const evento = route?.params?.evento;

  if (!evento) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Evento não encontrado 😢</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const titulo = evento?.name || evento?.titulo || "Evento";

  const descricao =
    evento?.shortDescription ||
    evento?.descricao ||
    "Sem descrição disponível.";

  const local =
    evento?.location?.name ||
    evento?.local ||
    "Local não informado";

  const imagem =
    evento?.image?.url ||
    evento?.imagem ||
    "https://placehold.co/600x400";

  const url = "https://www.secult.ce.gov.br/";

  // 🌐 WEBVIEW
  if (abrirWeb) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primaryDark, colors.secondary]}
          style={[
            styles.webHeader,
            { paddingTop: insets.top + 10 },
          ]}
        >
          <TouchableOpacity onPress={() => setAbrirWeb(false)}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.webHeaderTitle}>Site oficial</Text>
        </LinearGradient>

        <WebView source={{ uri: url }} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[colors.primaryDark, colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Evento</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 🖼️ BANNER */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: imagem }} style={styles.banner} />

          <LinearGradient
            colors={["transparent", colors.overlay]}
            style={styles.bannerOverlay}
          >
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.local}>📍 {local}</Text>
          </LinearGradient>
        </View>

        {/* 📄 DESCRIÇÃO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sobre o evento</Text>
          <Text style={styles.descricao}>{descricao}</Text>
        </View>

        {/* 🔥 AÇÕES */}
        <View style={styles.actions}>
          
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setAbrirWeb(true)}
          >
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={colors.primaryDark}
            />
            <Text style={styles.btnPrimaryText}>
              Ver no site oficial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.btnSecondaryText}>
              Favoritar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary}>
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.btnSecondaryText}>
              Compartilhar
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================
// 🎨 STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },

  webHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  webHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
  },

  bannerContainer: {
    height: 250,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  bannerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },

  titulo: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },

  local: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 13,
  },

  card: {
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  descricao: {
    color: colors.textTertiary,
    fontSize: 14,
    lineHeight: 20,
  },

  actions: {
    marginTop: 20,
    paddingHorizontal: 16,
    gap: 10,
  },

  btnPrimary: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  btnPrimaryText: {
    color: colors.primaryDark,
    fontWeight: "bold",
  },

  btnSecondary: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  btnSecondaryText: {
    color: colors.primary,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
  },

  emptyText: {
    color: colors.text,
    fontSize: 16,
  },

  voltar: {
    color: colors.primary,
    marginTop: 10,
  },
});
