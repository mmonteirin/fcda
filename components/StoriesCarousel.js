/**
 * 📸 COMPONENTE: CARROSSEL DE STORIES
 * Exibe stories dos seguidos com indicador de visto
 */

import React, { memo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";

// ✅ Item individual de story
const StoryItem = memo(({ storyGroup, onPress }) => {
  const primeiraStory = storyGroup.stories[0];
  const temNaoVista = !storyGroup.jaSeen;

  return (
    <TouchableOpacity
      style={[styles.storyItem, temNaoVista && styles.storyItemNaoVista]}
      onPress={() => onPress(storyGroup)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: storyGroup.userPhoto }}
        style={styles.storyAvatar}
      />

      {/* Indicador de novo story */}
      {temNaoVista && <View style={styles.novoIndicador} />}

      {/* Quantidade de stories */}
      {storyGroup.stories.length > 1 && (
        <View style={styles.qtdBadge}>
          <Text style={styles.qtdText}>{storyGroup.stories.length}</Text>
        </View>
      )}

      {/* Nome do usuário */}
      <Text style={styles.storyName} numberOfLines={1}>
        {storyGroup.userName}
      </Text>
    </TouchableOpacity>
  );
});

// ✅ Componente principal do carrossel
const StoriesCarousel = memo(
  ({
    stories,
    loading,
    onStoryPress,
    onCriarStory,
    mostrarCriarStory = true,
  }) => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    if (stories.length === 0 && !mostrarCriarStory) {
      return (
        <View style={styles.vazio}>
          <MaterialCommunityIcons
            name="image-outline"
            size={32}
            color={Colors.textMuted}
          />
          <Text style={styles.vazioText}>Nenhum story disponível</Text>
        </View>
      );
    }

    const dados = [];

    // Adicionar botão "Criar Story"
    if (mostrarCriarStory) {
      dados.push({ type: "criar" });
    }

    // Adicionar stories
    dados.push(...stories.map((s) => ({ ...s, type: "story" })));

    return (
      <FlatList
        data={dados}
        renderItem={({ item }) => {
          if (item.type === "criar") {
            return (
              <TouchableOpacity
                style={[styles.storyItem, styles.criarStoryBtn]}
                onPress={onCriarStory}
                activeOpacity={0.8}
              >
                <View style={styles.criarStoryAvatar}>
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.storyName}>Sua Story</Text>
              </TouchableOpacity>
            );
          }

          return (
            <StoryItem
              storyGroup={item}
              onPress={() => onStoryPress?.(item)}
            />
          );
        }}
        keyExtractor={(item, idx) =>
          item.type === "criar" ? "criar" : `${item.usuarioId}_${idx}`
        }
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      />
    );
  }
);

const styles = StyleSheet.create({
  carousel: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },

  storyItem: {
    width: 90,
    alignItems: "center",
  },

  storyItemNaoVista: {},

  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.border,
  },

  novoIndicador: {
    position: "absolute",
    top: 0,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  qtdBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: Colors.primary + "dd",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  qtdText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  storyName: {
    fontSize: 11,
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
  },

  criarStoryBtn: {},

  criarStoryAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary + "15",
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  loader: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  vazio: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  vazioText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default StoriesCarousel;
