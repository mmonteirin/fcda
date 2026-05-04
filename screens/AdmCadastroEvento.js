import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { db, storage } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { Colors } from "../styles/Colors";

/* 🔥 MÁSCARAS */
const maskCEP = (t) =>
  t.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);

const maskData = (t) =>
  t
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
    .slice(0, 10);

const maskHora = (t) =>
  t.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1:$2").slice(0, 5);

/* 🔥 SELECT MODAL */
const SelectModal = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Text style={{ color: Colors.textPrimary, marginBottom: 8 }}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={selectStyle}
      >
        <Text
          style={{
            color: value ? Colors.textPrimary : Colors.textMuted,
          }}
        >
          {value || "Selecione..."}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={Colors.primary}
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={modalOverlay}>
          <View style={modalBox}>
            {options.map((item) => {
              const ativo = value === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  style={[
                    modalItem,
                    {
                      backgroundColor: ativo
                        ? Colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: ativo
                        ? Colors.background
                        : Colors.textPrimary,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text
                style={{
                  color: Colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function AdmCadastroEvento({ navigation }) {
  const [form, setForm] = useState({});
  const [imagem, setImagem] = useState(null);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* 📸 IMAGEM */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const uploadImagem = async () => {
    if (!imagem) return null;

    const response = await fetch(imagem);
    const blob = await response.blob();

    const storageRef = ref(storage, `eventos/${Date.now()}`);
    await uploadBytes(storageRef, blob);

    return await getDownloadURL(storageRef);
  };

  /* 🔍 CEP */
  const buscarCEP = async () => {
    const cepLimpo = form.cep?.replace(/\D/g, "");

    if (!cepLimpo || cepLimpo.length !== 8) {
      Alert.alert("Digite um CEP válido");
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        Alert.alert("CEP não encontrado");
        return;
      }

      setForm((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      }));
    } catch {
      Alert.alert("Erro ao buscar CEP");
    }
  };

  /* 🚀 SUBMIT */
  const handleSubmit = async () => {
    if (!form.titulo) {
      Alert.alert("Preencha o nome do evento");
      return;
    }

    try {
      const imageUrl = await uploadImagem();

      await addDoc(collection(db, "eventos"), {
        ...form,
        imagem: imageUrl,
        createdAt: new Date(),
      });

      Alert.alert("Evento criado!");
      navigation.goBack();
    } catch {
      Alert.alert("Erro ao salvar");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* HEADER */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text style={title}>Criar Evento</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* TOPO */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={pickImage} style={{ flex: 1, marginRight: 10 }}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={image} />
            ) : (
              <View style={imagePlaceholder}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={40}
                  color={Colors.primary}
                />
                <Text style={{ color: Colors.textSecondary }}>
                  Adicionar imagem
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <SelectModal
              label="Categoria"
              value={form.categoria}
              options={["Teatro", "Shows", "Cinema"]}
              onSelect={(v) => setField("categoria", v)}
            />

            <View style={{ marginTop: 10 }}>
              <SelectModal
                label="Tipo"
                value={form.tipoEvento}
                options={["gratuito", "pago"]}
                onSelect={(v) => setField("tipoEvento", v)}
              />
            </View>
          </View>
        </View>

        {/* NOME */}
        <TextInput
          placeholder="Nome do evento"
          placeholderTextColor={Colors.textMuted}
          onChangeText={(v) => setField("titulo", v)}
          style={input}
        />

        {/* DATA */}
        <TextInput
          placeholder="Data"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
          value={form.data || ""}
          onChangeText={(v) => setField("data", maskData(v))}
          style={input}
        />

        {/* HORÁRIOS */}
        <View style={{ flexDirection: "row" }}>
          <TextInput
            placeholder="Início"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={form.horaInicio || ""}
            onChangeText={(v) => setField("horaInicio", maskHora(v))}
            style={[input, { flex: 1, marginRight: 10 }]}
          />

          <TextInput
            placeholder="Término"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={form.horaFim || ""}
            onChangeText={(v) => setField("horaFim", maskHora(v))}
            style={[input, { flex: 1 }]}
          />
        </View>

        {/* CEP + RUA */}
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TextInput
            value={form.cep || ""}
            placeholder="CEP"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            onChangeText={(v) => setField("cep", maskCEP(v))}
            style={[input, { flex: 1, marginRight: 10 }]}
          />

          <TextInput
            value={form.rua || ""}
            placeholder="Rua"
            placeholderTextColor={Colors.textMuted}
            style={[input, { flex: 2 }]}
          />

          <TouchableOpacity onPress={buscarCEP} style={btnCep}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* BOTÃO */}
        <TouchableOpacity onPress={handleSubmit} style={btn}>
          <Text style={{ fontWeight: "bold", color: Colors.background }}>
            Cadastrar Evento
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* 🎨 STYLES */
const header = {
  paddingTop: 50,
  padding: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
};

const title = {
  color: Colors.textPrimary,
  fontSize: 24,
  marginTop: 10,
};

const input = {
  backgroundColor: Colors.surface,
  color: Colors.textPrimary,
  padding: 14,
  borderRadius: 14,
  marginTop: 10,
};

const selectStyle = {
  backgroundColor: Colors.surface,
  padding: 16,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.border,
  flexDirection: "row",
  justifyContent: "space-between",
};

const btnCep = {
  backgroundColor: Colors.primary,
  padding: 14,
  marginLeft: 10,
  borderRadius: 14,
  justifyContent: "center",
};

const btn = {
  backgroundColor: Colors.primary,
  padding: 16,
  borderRadius: 14,
  marginTop: 20,
  alignItems: "center",
};

const image = {
  height: 180,
  borderRadius: 16,
};

const imagePlaceholder = {
  height: 180,
  borderRadius: 16,
  backgroundColor: Colors.surface,
  justifyContent: "center",
  alignItems: "center",
};

const modalOverlay = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  padding: 20,
};

const modalBox = {
  backgroundColor: Colors.surface,
  borderRadius: 20,
  padding: 15,
};

const modalItem = {
  padding: 15,
  borderRadius: 12,
  marginBottom: 8,
};
