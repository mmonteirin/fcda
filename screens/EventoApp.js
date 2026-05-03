import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

import GlobalStyles from "../styles/GlobalStyles";
import { Colors } from "../styles/Colors";

const styles = GlobalStyles;

export default function EventosApp() {
  const { user, nome, foto } = useAuth();
  const navigation = useNavigation();

  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "inscricoes"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEventos(lista);
    });

    return () => unsubscribe();
  }, [user]);

  const cancelarInscricao = (id) => {
    Alert.alert("Cancelar", "Deseja cancelar inscrição?", [
      { text: "Não" },
      {
        text: "Sim",
        onPress: async () => {
          await deleteDoc(doc(db, "inscricoes", id));
        },
      },
    ]);
  };

  const renderRightActions = (id, progress) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          justifyContent: "center",
          alignItems: "center",
          width: 100,
          backgroundColor: Colors.error,
          borderRadius: 16,
          marginBottom: 15,
        }}
      >
        <TouchableOpacity onPress={() => cancelarInscricao(id)}>
          <MaterialCommunityIcons name="delete" size={26} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }) => {
    const confirmado = item.status === "confirmado";

    return (
      <Swipeable
        renderRightActions={(progress) =>
          renderRightActions(item.id, progress)
        }
      >
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            marginBottom: 15,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Image
            source={{ uri: item.imagem || "https://picsum.photos/400/200" }}
            style={{ width: "100%", height: 160 }}
          />

          <View style={{ padding: 15 }}>
            <Text
              style={{
                color: Colors.textPrimary,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {item.titulo}
            </Text>

            {/* DATA */}
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color={Colors.textSecondary}
              />
              <Text
                style={{
                  color: Colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                {item.data}
              </Text>
            </View>

            {/* LOCAL */}
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={Colors.textSecondary}
              />
              <Text
                style={{
                  color: Colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                {item.local}
              </Text>
            </View>

            {/* STATUS */}
            <View
              style={{
                marginTop: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                backgroundColor: confirmado
                  ? Colors.success
                  : Colors.warning,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {confirmado ? "Confirmado" : "Pendente"}
              </Text>
            </View>

            {/* AÇÕES */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EventoPublico", {
                    evento: item,
                  })
                }
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Ver Evento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => cancelarInscricao(item.id)}>
                <Text
                  style={{
                    color: Colors.error,
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: Colors.textPrimary,
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 15,
          }}
        >
          Meus Eventos
        </Text>
      </View>

      {/* PERFIL */}
      <View style={{ alignItems: "center", marginBottom: 15 }}>
        <Image
          source={{ uri: foto || "https://i.pravatar.cc/150" }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: Colors.primary,
          }}
        />

        <Text
          style={{
            color: Colors.textPrimary,
            marginTop: 8,
            fontWeight: "bold",
          }}
        >
          {nome}
        </Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text
            style={{
              color: Colors.textMuted,
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Você ainda não se inscreveu em eventos 😢
          </Text>
        }
      />
    </View>
  );
}
