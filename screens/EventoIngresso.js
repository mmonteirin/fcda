import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { comprarIngresso } from "../services/ingressoService";

import Colors from "../styles/Colors"; // ✅ NOVO

export default function EventoIngresso({ route, navigation }) {
  const { evento } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleCompra = async () => {
    setLoading(true);

    const sucesso = await comprarIngresso({
      eventoId: evento.id,
      user,
      valor: evento.valor || 0,
    });

    setLoading(false);

    if (sucesso) {
      Alert.alert("Sucesso 🎉", "Ingresso comprado!");
      navigation.goBack();
    } else {
      Alert.alert("Erro", "Não foi possível concluir");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primaryDark }}>
      
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.secondary]}
        style={{
          padding: 20,
          paddingTop: 50,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Inicio");
              }
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 22,
              color: Colors.text,
              fontFamily: "PoppinsBold",
              marginLeft: 10,
            }}
          >
            Ingresso 🎟️
          </Text>
        </View>

        <Text style={{ color: Colors.textSecondary, marginTop: 5 }}>
          Confirme os detalhes do evento
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* 🎬 IMAGEM */}
        <Image
          source={{ uri: evento.imagem }}
          style={{
            height: 200,
            borderRadius: 16,
            marginBottom: 15,
          }}
        />

        {/* 📦 CARD INFO */}
        <View
          style={{
            backgroundColor: Colors.secondary,
            borderRadius: 16,
            padding: 15,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text
            style={{
              color: Colors.text,
              fontSize: 18,
              fontFamily: "PoppinsBold",
            }}
          >
            {evento.titulo}
          </Text>

          <Text
            style={{
              color: Colors.textSecondary,
              marginTop: 5,
              marginBottom: 10,
            }}
          >
            {evento.nomeLocal}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={20}
              color={Colors.primary}
            />

            <Text
              style={{
                color: Colors.primary,
                fontSize: 16,
                marginLeft: 8,
                fontFamily: "PoppinsMedium",
              }}
            >
              {evento.tipoEvento === "gratuito"
                ? "Gratuito"
                : `R$ ${evento.valor}`}
            </Text>
          </View>
        </View>

        {/* 🚀 BOTÃO */}
        <TouchableOpacity
          onPress={handleCompra}
          disabled={loading}
          style={{
            marginTop: 25,
            backgroundColor: Colors.primary,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Text
            style={{
              color: Colors.primaryDark,
              fontSize: 16,
              fontFamily: "PoppinsBold",
            }}
          >
            {loading ? "Processando..." : "Comprar Ingresso"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
