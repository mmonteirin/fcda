/**
 * 💬 TELA: VISUALIZADOR DE CHAT
 * Exibe conversa individual com envio de mensagens
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";
import { useConversation } from "../hooks/useDirectMessages";
import ChatViewer from "../components/ChatViewer";

const TelaMensagens = ({ navigation, route }) => {
  const { conversaId, conversa, auth } = route?.params;
  const userId = auth?.currentUser?.uid;

  const {
    mensagens,
    loading,
    enviando,
    enviar,
    deletar,
    editar,
  } = useConversation(userId, conversaId);

  const [outroUserId] = useState(
    conversa.participantes[0] === userId
      ? conversa.participantes[1]
      : conversa.participantes[0]
  );

  // ✅ Configurar header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      },
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image
            source={{
              uri: `https://i.pravatar.cc/100?u=${outroUserId}`,
            }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerNome}>
              Usuário {outroUserId.slice(0, 4)}
            </Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.btnHeader}
            onPress={() => handleCall("video")}
          >
            <MaterialCommunityIcons
              name="video"
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnHeader}
            onPress={() => handleCall("audio")}
          >
            <MaterialCommunityIcons
              name="phone"
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnHeader}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, outroUserId]);

  const handleCall = (tipo) => {
    Alert.alert(
      `Chamada de ${tipo}`,
      `Iniciar chamada de ${tipo} com usuário?`,
      [
        { text: "Cancelar" },
        { text: "Iniciar", onPress: () => console.log(`Iniciando ${tipo}`) },
      ]
    );
  };

  const handleEnviar = useCallback(
    async (dados) => {
      const resultado = await enviar({
        texto: dados.texto,
        remetenteName: dados.remetenteName,
      });

      if (!resultado.success) {
        Alert.alert("Erro", resultado.error || "Falha ao enviar");
      }
    },
    [enviar]
  );

  const handleDeletar = useCallback(
    async (mensagemId) => {
      Alert.alert(
        "Deletar mensagem?",
        "Esta ação não pode ser desfeita",
        [
          { text: "Cancelar" },
          {
            text: "Deletar",
            onPress: async () => {
              const resultado = await deletar(mensagemId);
              if (!resultado.success) {
                Alert.alert("Erro", resultado.error);
              }
            },
            style: "destructive",
          },
        ]
      );
    },
    [deletar]
  );

  const handleEditar = useCallback(
    async (mensagemId, novoTexto) => {
      const resultado = await editar(mensagemId, novoTexto);
      if (!resultado.success) {
        Alert.alert("Erro", resultado.error);
      }
    },
    [editar]
  );

  return (
    <View style={styles.container}>
      <ChatViewer
        mensagens={mensagens}
        loading={loading}
        enviando={enviando}
        userId={userId}
        nomePerfil={conversa.meNome}
        onEnviar={handleEnviar}
        onDelete={handleDeletar}
        onEdit={handleEditar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  headerNome: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  headerStatus: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 12,
  },

  btnHeader: {
    padding: 8,
  },
});

export default TelaMensagens;
