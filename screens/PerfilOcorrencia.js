import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  collectionGroup,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function PerfilOcorrencia({ navigation }) {
  const [tab, setTab] = useState("avaliacoes");

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);

  const userId = auth.currentUser?.uid;

  /* ⭐ AVALIAÇÕES */
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collectionGroup(db, "avaliacoes"),
      where("userId", "==", userId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAvaliacoes(data);
    });

    return () => unsub();
  }, [userId]);

  /* 🚨 OCORRÊNCIAS */
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collectionGroup(db, "ocorrencias"),
      where("userId", "==", userId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOcorrencias(data);
    });

    return () => unsub();
  }, [userId]);

  return (
    <View style={styles.container}>

      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <AppText style={styles.title}>
          Meu Histórico
        </AppText>
      </View>

      {/* 🔥 TABS */}
      <View style={styles.tabsWrapper}>
        {["avaliacoes", "ocorrencias"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tab,
              tab === t && styles.activeTab,
            ]}
          >
            <AppText
              style={[
                styles.tabText,
                tab === t && styles.activeTabText,
              ]}
            >
              {t === "avaliacoes" ? "Avaliações" : "Ocorrências"}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 LISTA */}
      <FlatList
        contentContainerStyle={styles.list}
        data={tab === "avaliacoes" ? avaliacoes : ocorrencias}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <AppText style={styles.empty}>
            Nenhum registro encontrado
          </AppText>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            <AppText style={styles.local}>
              📍 {item.local || "Evento"}
            </AppText>

            {tab === "avaliacoes" && (
              <AppText style={styles.rating}>
                ⭐ Nota: {item.nota}
              </AppText>
            )}

            <AppText style={styles.text}>
              {item.comentario || item.descricao}
            </AppText>

          </View>
        )}
      />
    </View>
  );
}

/* 🎨 PADRÃO GLOBAL */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },

  tabsWrapper: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: Colors.primary,
  },

  tabText: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontWeight: "bold",
  },

  activeTabText: {
    color: "#fff",
  },

  list: {
    padding: 16,
  },

  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 30,
  },

  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  local: {
    color: Colors.primary,
    fontSize: 13,
    marginBottom: 6,
  },

  rating: {
    color: Colors.warning,
    marginBottom: 6,
  },

  text: {
    color: Colors.textSecondary,
  },
});
