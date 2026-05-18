import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../styles/Colors";

export default function ComunidadeCriadorDetalhes({
  route,
  navigation,
}) {
  const { creatorId } = route.params;
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você carregaria os detalhes do criador
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar criador:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criador</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE SECTION */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.profileImage}>
            <MaterialCommunityIcons
              name="account"
              size={80}
              color={Colors.textPrimary}
            />
          </View>
          <Text style={styles.creatorName}>Criador em Destaque</Text>
          <Text style={styles.creatorGenre}>Gênero</Text>

          {/* STATS */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Obras</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Curtidas</Text>
            </View>
          </View>

          {/* BUTTONS */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.followButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.followButtonText}>Seguir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="message-outline"
                size={20}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.sectionContent}>
            Descrição do criador em destaque. Aqui você pode visualizar
            informações sobre o criador selecionado.
          </Text>
        </View>

        {/* PORTFOLIO SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfólio</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.portfolioGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={styles.portfolioItem}
              >
                <View style={styles.portfolioPlaceholder}>
                  <MaterialCommunityIcons
                    name="image"
                    size={32}
                    color={Colors.textMuted}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* RECENT WORKS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Obras Recentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.workItem}
              activeOpacity={0.7}
            >
              <View style={styles.workImage}>
                <MaterialCommunityIcons
                  name="image"
                  size={40}
                  color={Colors.textMuted}
                />
              </View>
              <View style={styles.workInfo}>
                <Text style={styles.workTitle}>Obra {item}</Text>
                <Text style={styles.workDate}>Há 2 dias</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  creatorName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  creatorGenre: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  followButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  followButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  messageButton: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  sectionContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  portfolioItem: {
    width: "48%",
    aspectRatio: 1,
  },
  portfolioPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workInfo: {
    flex: 1,
  },
  workTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  workDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
