import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

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

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../styles/Colors"; // ✅ NOVO

export default function AdmEvento({ navigation }) {
  const { user, nome, foto } = useAuth();
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    try {
      const q = query(
        collection(db, "eventos"),
        where("uid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEventos(lista);
    } catch (error) {
      console.log("Erro ao buscar eventos:", error);
    }
  };

  useEffect(() => {
    if (user) fetchEventos();
  }, [user]);

  const deletarEvento = (id) => {
    Alert.alert("Excluir", "Deseja excluir este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "eventos", id));
            fetchEventos();
          } catch {
            Alert.alert("Erro ao excluir");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: Colors.secondary,
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        flexDirection: "row",
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      {/* 📷 IMAGEM */}
      <Image
        source={{
          uri: item.imagem || "https://via.placeholder.com/100",
        }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 10,
        }}
      />

      {/* 📄 INFO */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Colors.text,
            fontWeight: "bold",
            fontSize: 15,
          }}
        >
          {item.titulo}
        </Text>

        <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
          {item.nomeLocal || "Local não informado"}
        </Text>

        <Text style={{ color: Colors.primary, fontSize: 12 }}>
          {item.data}
        </Text>
      </View>

      {/* ⚙️ AÇÕES */}
      <View style={{ justifyContent: "space-between" }}>
        
        {/* 🗑️ deletar */}
        <TouchableOpacity onPress={() => deletarEvento(item.id)}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color={Colors.danger}
          />
        </TouchableOpacity>

        {/* 📊 dashboard */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DashboardEvento", { evento: item })
          }
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: Colors.primaryDark,
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primaryDark }}>

      {/* 👤 HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 18,
        }}
      >
        <Image
          source={{ uri: foto }}
          style={{
            width: 55,
            height: 55,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginRight: 10,
          }}
        />

        <View>
          <Text style={{ color: Colors.text, fontWeight: "bold" }}>
            {nome}
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Organizador
          </Text>
        </View>
      </View>

      {/* 🔝 TOPO */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 18,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: Colors.text,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Meus Eventos
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("CriarEvento")}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={Colors.primaryDark}
          />
          <Text style={{ color: Colors.primaryDark, fontWeight: "bold" }}>
            Criar
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📋 LISTA */}
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 18 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <MaterialCommunityIcons
              name="calendar-remove"
              size={50}
              color={Colors.textLight}
            />
            <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>
              Nenhum evento cadastrado
            </Text>
          </View>
        }
      />
    </View>
  );
}
