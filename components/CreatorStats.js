import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";
import { getCreatorMetrics } from "../services/profileService";

/**
 * Componente para exibir estatísticas do criador
 */
export const CreatorStats = ({ userId, followers, following }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getCreatorMetrics(userId);
        setMetrics(data);
      } catch (error) {
        console.log("Erro ao carregar métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [userId]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Seguidores */}
      <View style={styles.stat}>
        <Text style={styles.statValue}>{formatNumber(followers || 0)}</Text>
        <Text style={styles.statLabel}>Seguidores</Text>
      </View>

      {/* Eventos */}
      <View style={styles.stat}>
        <Text style={styles.statValue}>{formatNumber(metrics?.totalEventos || 0)}</Text>
        <Text style={styles.statLabel}>Eventos</Text>
      </View>

      {/* Likes */}
      <View style={styles.stat}>
        <Text style={styles.statValue}>{formatNumber(metrics?.totalLikes || 0)}</Text>
        <Text style={styles.statLabel}>Likes</Text>
      </View>

      {/* Engagement Rate */}
      <View style={styles.stat}>
        <Text style={styles.statValue}>{(metrics?.engagementRate * 100 || 0).toFixed(1)}%</Text>
        <Text style={styles.statLabel}>Engagement</Text>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  loading: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
};
