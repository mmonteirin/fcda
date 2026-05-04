import React, { useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function ProfileScreen() {
  const [nome, setNome] = useState("Pedrin");
  const [foto, setFoto] = useState("https://i.pravatar.cc/100");
  const [avaliacoes, setAvaliacoes] = useState(0);
  const [ocorrencias, setOcorrencias] = useState(3);

  const [eventos] = useState([
    {
      id: 1,
      titulo: "Theatro José de Alencar",
      data: "18 de Maio",
      imagem: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      titulo: "Sana Parte II",
      data: "11 de Julho",
      imagem: "https://via.placeholder.com/100",
    },
  ]);

  /* 📸 FOTO */
  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      alert("Permissão necessária!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* 👤 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={escolherFoto}>
          <Image source={{ uri: foto }} style={styles.avatar} />
        </TouchableOpacity>

        <AppText style={styles.nome}>{nome}</AppText>
      </View>

      {/* 📊 CARDS */}
      <View style={styles.cardsRow}>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="star-outline"
            size={22}
            color={Colors.primary}
          />
          <AppText style={styles.label}>Avaliações</AppText>
          <AppText style={styles.number}>{avaliacoes}</AppText>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={22}
            color={Colors.primary}
          />
          <AppText style={styles.label}>Ocorrências</AppText>
          <AppText style={styles.number}>{ocorrencias}</AppText>
        </View>

      </View>

      {/* 🎟️ EVENTOS */}
      <AppText style={styles.section}>Eventos Visitados</AppText>

      {eventos.map((evento) => (
        <View key={evento.id} style={styles.eventCard}>

          <Image source={{ uri: evento.imagem }} style={styles.eventImage} />

          <View style={{ marginLeft: 12 }}>
            <AppText style={styles.eventTitle}>
              {evento.titulo}
            </AppText>
            <AppText style={styles.eventDate}>
              {evento.data}
            </AppText>
          </View>

        </View>
      ))}

    </ScrollView>
  );
}

/* 🎨 PADRÃO GLOBAL */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 10,
  },

  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  number: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
  },

  section: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  eventCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },

  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  eventTitle: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },

  eventDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
