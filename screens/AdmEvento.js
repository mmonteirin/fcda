import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../styles/Colors";

export default function AdmEvento({ navigation }) {
  const { user, nome, foto } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 AGORA USANDO MOCK
  const fetchEventos = async () => {
    setLoading(true);

    try {
      const eventosFake = [
        {
          id: "1",
          titulo: "WOW 5 Anos",
          nomeLocal: "São Paulo Expo",
          data: "24 de Agosto • 22:00",
          imagem:
            "https://images.sympla.com.br/64f8b1f4c2c6f-lg.jpg",
        },
        {
          id: "2",
          titulo: "Festival Eletrônico SP",
          nomeLocal: "Allianz Parque",
          data: "12 de Setembro • 18:00",
          imagem:
            "https://placehold.co/600x400/0f172a/ffffff?text=Festival",
        },
        {
          id: "3",
          titulo: "Noite do Trap",
          nomeLocal: "Audio Club",
          data: "05 de Outubro • 23:00",
          imagem:
            "https://placehold.co/600x400/1e293b/ffffff?text=Trap",
        },
        {
          id: "4",
          titulo: "Sunset Party Rooftop",
          nomeLocal: "Vila Madalena",
          data: "20 de Outubro • 16:00",
          imagem:
            "https://placehold.co/600x400/7c3aed/ffffff?text=Sunset",
        },
      ];

      setTimeout(() => {
        setEventos(eventosFake);
        setLoading(false);
      }, 800);
    } catch (e) {
      console.log("Erro ao carregar mock:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const deletarEvento = (id) => {
    Alert.alert("Excluir", "Deseja excluir este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            // 🔥 remove do mock (sem Firebase)
            setEventos((prev) => prev.filter((item) => item.id !== id));
          } catch {
            Alert.alert("Erro ao excluir");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            item.imagem ||
            "https://placehold.co/400x200/1a0533/ffffff?text=Evento",
        }}
        style={styles.image}
      />

      <View style={{ padding: 14 }}>
        <Text style={styles.titulo}>{item.titulo}</Text>

        <Text style={styles.local}>
          📍 {item.nomeLocal || "Local não informado"}
        </Text>

        <Text style={styles.data}>
          📅 {item.data || "Data não informada"}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => deletarEvento(item.id)}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={22}
              color={Colors.error}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={() =>
              navigation.navigate("DashboardEvento", {
                eventoId: item.id,
              })
            }
          >
            <Text style={styles.dashboardText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* HEADER */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 10 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image
            source={{
              uri: foto || "https://i.pravatar.cc/100",
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.nome}>{nome || "Usuário"}</Text>
            <Text style={styles.sub}>Organizador</Text>
          </View>
        </View>

        <Text style={styles.title}>Meus Eventos</Text>
      </LinearGradient>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum evento cadastrado 😢
          </Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CriarEvento")}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 STYLES */
const styles = {
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  nome: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },

  sub: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  image: {
    width: "100%",
    height: 160,
  },

  titulo: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },

  local: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  data: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },

  dashboardBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  dashboardText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
};
