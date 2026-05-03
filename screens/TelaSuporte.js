import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";

import { Colors } from "../styles/Colors";

export default function TelaSuporte({ navigation }) {
  const { user } = useAuth();

  const [categoria, setCategoria] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const categorias = [
    "Problema com Login",
    "Problema com Evento",
    "Pagamento",
    "Bug no App",
    "Outro",
  ];

  const handleSubmit = async () => {
    if (!categoria || !mensagem) {
      Alert.alert("Preencha todos os campos");
      return;
    }

    try {
      await addDoc(collection(db, "suporte"), {
        uid: user?.uid,
        email: user?.email,
        categoria,
        mensagem,
        status: "aberto",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Suporte enviado com sucesso!");
      setCategoria("");
      setMensagem("");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao enviar suporte");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
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
              size={26}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Suporte 💬
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Precisa de ajuda? Fale com a gente
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 📂 SELECT */}
        <Text style={styles.label}>
          Tipo de problema
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.select}
        >
          <Text style={{ color: categoria ? Colors.textPrimary : Colors.textMuted }}>
            {categoria || "Selecione uma opção..."}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* 📝 MENSAGEM */}
        <Text style={styles.label}>
          Descreva o problema
        </Text>

        <TextInput
          placeholder="Digite aqui..."
          placeholderTextColor={Colors.textMuted}
          multiline
          value={mensagem}
          onChangeText={setMensagem}
          style={styles.textarea}
        />

        {/* 🚀 BOTÃO */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Enviar solicitação
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* 🪟 MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {categorias.map((item) => {
              const ativo = categoria === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setCategoria(item);
                    setModalVisible(false);
                  }}
                  style={[
                    styles.option,
                    ativo && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ativo && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancel}
            >
              <Text style={{ color: Colors.textSecondary }}>
                Cancelar
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: "bold",
    marginLeft: 10,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 5,
  },

  content: {
    padding: 20,
  },

  label: {
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 10,
  },

  select: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textarea: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    padding: 15,
    borderRadius: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 15,
  },

  option: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },

  optionActive: {
    backgroundColor: Colors.primary,
  },

  optionText: {
    color: Colors.textPrimary,
  },

  optionTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancel: {
    marginTop: 10,
    padding: 12,
    alignItems: "center",
  },
});
