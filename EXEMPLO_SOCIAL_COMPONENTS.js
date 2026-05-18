/**
 * 📘 EXEMPLO COMPLETO: Como Usar Novos Componentes Sociais
 * 
 * Este arquivo mostra como integrar:
 * - SecaoComentarios
 * - useLike hook
 * - Mentions & Hashtags
 * - SeguidoresCard
 * 
 * Copie e adapte para seu projeto!
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFollow } from "../hooks/useFollow";
import { useLike } from "../hooks/useLike";

// 🆕 Novos imports
import SecaoComentarios from "../components/SecaoComentarios";
import { SeguidoresCard } from "../components/SeguidoresCard";
import {
  TextoComMencoeseHashtags,
  HashtagsList,
  extrairHashtags,
} from "../utils/mentionsHashtags";
import { Colors } from "../styles/Colors";

/**
 * EXEMPLO: TelaEventoMelhorada
 * 
 * Mostra como usar os novos componentes no TelaEventoDetalhes
 */
export default function TelaEventoMelhorada({ route, navigation }) {
  const { evento, creator } = route.params;
  const { user } = useAuth();

  // ✅ NOVO: Hook para likes
  const { gostei, toggleLike, likesCount } = useLike(
    evento.id,
    user?.uid
  );

  // ✅ NOVO: Hook para seguir criador
  const { seguindo, toggleFollow } = useFollow(
    creator?.id,
    user?.uid
  );

  // ✅ NOVO: Extrair hashtags do evento
  const hashtags = useMemo(
    () => extrairHashtags(evento.descricao),
    [evento.descricao]
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════════════════════════
          HEADER DO EVENTO
          ════════════════════════════════════════ */}
      <View>
        <Image
          source={{ uri: evento.imagemEvento }}
          style={styles.imagemEvento}
        />

        {/* Overlay com info */}
        <View style={styles.overlay}>
          <Text style={styles.titulo}>{evento.tituloEvento}</Text>
          <Text style={styles.local}>📍 {evento.localEvento}</Text>
        </View>
      </View>

      {/* ════════════════════════════════════════
          AÇÕES PRINCIPAIS (Like, Share, Mais)
          ════════════════════════════════════════ */}
      <View style={styles.acoes}>
        {/* ❤️ Like */}
        <TouchableOpacity
          style={styles.acaoBtn}
          onPress={toggleLike}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={gostei ? "heart" : "heart-outline"}
            size={24}
            color={gostei ? Colors.error : Colors.textPrimary}
          />
          <Text style={styles.acaoLabel}>{likesCount}</Text>
        </TouchableOpacity>

        {/* 💬 Comentarios */}
        <TouchableOpacity
          style={styles.acaoBtn}
          onPress={() => {
            // Scroll para comentarios
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="comment-outline"
            size={24}
            color={Colors.textPrimary}
          />
          <Text style={styles.acaoLabel}>10</Text>
        </TouchableOpacity>

        {/* 🎫 Ingressos */}
        <TouchableOpacity
          style={[styles.acaoBtn, styles.acoaoBtnPrimary]}
          onPress={() => {
            navigation.navigate("TelaIngressos", { evento });
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="ticket-outline"
            size={24}
            color={Colors.primary}
          />
          <Text style={[styles.acaoLabel, { color: Colors.primary }]}>
            Comprar
          </Text>
        </TouchableOpacity>

        {/* ↗️ Compartilhar */}
        <TouchableOpacity
          style={styles.acaoBtn}
          onPress={() => {
            // Compartilhar
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="share-outline"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* ════════════════════════════════════════
          INFORMAÇÕES DO EVENTO
          ════════════════════════════════════════ */}
      <View style={styles.content}>
        {/* Data/Hora */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.infoText}>
            {evento.dataEvento} às {evento.horaInicio}
          </Text>
        </View>

        {/* Descrição com MENTIONS E HASHTAGS 🆕 */}
        <Text style={styles.descTitle}>Descrição</Text>
        <TextoComMencoeseHashtags
          texto={evento.descricao}
          style={styles.descricao}
          onMencaoPress={(usuario) => {
            console.log("Clicou em:", usuario);
            navigation.navigate("PerfilPublico", { userId: usuario });
          }}
          onHashtagPress={(tag) => {
            console.log("Clicou em #:", tag);
            navigation.navigate("TelaBusca", { hashtag: tag });
          }}
        />

        {/* Hashtags em cards 🆕 */}
        {hashtags.length > 0 && (
          <HashtagsList
            hashtags={hashtags.map((h) => h.tag)}
            onHashtagPress={(tag) => {
              navigation.navigate("TelaBusca", { hashtag: tag });
            }}
          />
        )}
      </View>

      {/* ════════════════════════════════════════
          CARD DO CRIADOR/ORGANIZADOR 🆕
          ════════════════════════════════════════ */}
      {creator && (
        <View style={styles.creatorSection}>
          <Text style={styles.creatorTitle}>Organizador</Text>
          <SeguidoresCard
            creator={creator}
            onNavigateProfile={() => {
              navigation.navigate("PerfilPublico", { userId: creator.id });
            }}
          />
        </View>
      )}

      {/* ════════════════════════════════════════
          SEÇÃO DE COMENTÁRIOS 🆕
          ════════════════════════════════════════ */}
      <SecaoComentarios
        postId={evento.id}
        canComment={!!user}
      />

      {/* Espaço extra */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // HEADER
  imagemEvento: {
    width: "100%",
    height: 250,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  local: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },

  // AÇÕES
  acoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },

  acaoBtn: {
    alignItems: "center",
    gap: 4,
  },

  acoaoBtnPrimary: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  acaoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },

  // CONTENT
  content: {
    paddingHorizontal: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  descTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },

  descricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // CRIADOR
  creatorSection: {
    paddingHorizontal: 16,
    marginVertical: 24,
  },

  creatorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
});

/**
 * ═══════════════════════════════════════════════════════════
 * EXEMPLO 2: Integrar no TelaFeed para Lista
 * ═══════════════════════════════════════════════════════════
 */

export function EventoCardMelhorado({ item, navigation }) {
  const { user } = useAuth();
  const { gostei, toggleLike, likesCount } = useLike(item.id, user?.uid);
  const hashtags = useMemo(
    () => extrairHashtags(item.descricao).slice(0, 2),
    [item.descricao]
  );

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() =>
        navigation.navigate("EventoDetalhes", { evento: item })
      }
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imagemEvento }} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.tituloEvento}</Text>
        <Text style={styles.cardLocal}>📍 {item.localEvento}</Text>

        {/* Descrição com mentions/hashtags */}
        <TextoComMencoeseHashtags
          texto={item.descricao.substring(0, 100) + "..."}
          style={styles.cardDesc}
          onMencaoPress={(usuario) =>
            navigation.navigate("PerfilPublico", { userId: usuario })
          }
          onHashtagPress={(tag) =>
            navigation.navigate("TelaBusca", { hashtag: tag })
          }
        />

        {/* Hashtags preview */}
        <HashtagsList hashtags={hashtags.map((h) => h.tag)} />

        {/* Footer com ações */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.cardAction}
            onPress={toggleLike}
          >
            <MaterialCommunityIcons
              name={gostei ? "heart" : "heart-outline"}
              size={18}
              color={gostei ? Colors.error : Colors.textMuted}
            />
            <Text style={styles.cardActionText}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardAction}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={18}
              color={Colors.textMuted}
            />
            <Text style={styles.cardActionText}>5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardAction}
            onPress={() =>
              navigation.navigate("TelaIngressos", { evento: item })
            }
          >
            <MaterialCommunityIcons
              name="ticket-outline"
              size={18}
              color={Colors.primary}
            />
            <Text style={[styles.cardActionText, { color: Colors.primary }]}>
              Comprar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  eventCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardImage: {
    width: "100%",
    height: 180,
  },

  cardContent: {
    padding: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  cardLocal: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },

  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  cardActionText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
});
