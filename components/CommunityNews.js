import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";

export default function CommunityNews({
  id,
  title,
  excerpt,
  image,
  authorName,
  viewsCount = 0,
  likesCount = 0,
  createdAt,
  onPress,
  onLike,
  isLiked = false,
}) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* IMAGE */}
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        )}
        
        {!image && (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons
              name="newspaper"
              size={40}
              color={Colors.primary}
            />
          </View>
        )}

        {/* CONTENT */}
        <View style={styles.content}>
          {/* TITLE */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* EXCERPT */}
          <Text style={styles.excerpt} numberOfLines={2}>
            {excerpt}
          </Text>

          {/* METADATA */}
          <View style={styles.metadata}>
            <Text style={styles.author}>{authorName}</Text>
            <Text style={styles.timestamp}>
              • {formatDate(createdAt)}
            </Text>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="eye"
                  size={14}
                  color={Colors.textMuted}
                />
                <Text style={styles.statText}>
                  {viewsCount > 999
                    ? `${(viewsCount / 1000).toFixed(1)}k`
                    : viewsCount}
                </Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="heart"
                  size={14}
                  color={isLiked ? Colors.error : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.statText,
                    isLiked && { color: Colors.error },
                  ]}
                >
                  {likesCount}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={onLike}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? Colors.error : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.surface,
  },
  placeholderImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  excerpt: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  likeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(108, 92, 231, 0.1)",
  },
});
