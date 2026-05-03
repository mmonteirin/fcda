import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useCadastro } from "../context/CadastroContext";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

export default function PerfilCadastro({ navigation }) {
  const { registerUser } = useCadastro();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    let newValue = value;

    if (field === "email") {
      newValue = value.trim().toLowerCase();
    }

    setForm({ ...form, [field]: newValue });
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setError("");

    const { nome, email, password, confirmPassword } = form;

    if (!nome || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Email inválido");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    const response = await registerUser({
      nome,
      email,
      password,
    });

    if (response.success) {
      alert("Conta criada com sucesso!");
      navigation.navigate("Login");
    } else {
      setError(response.message);
    }
  };

  // 🔥 estilos padronizados
  const input = {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  };

  const label = {
    color: colors.primary,
    marginBottom: 3,
    fontSize: 13,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primaryDark }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 40,
        }}
      >
        {/* 🔙 VOLTAR */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather
            name="chevron-left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* 🧾 TÍTULO */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginVertical: 12,
          }}
        >
          Criar Conta
        </Text>

        {/* 👤 NOME */}
        <View style={{ marginBottom: 10 }}>
          <Text style={label}>Nome</Text>
          <TextInput
            style={input}
            value={form.nome}
            onChangeText={(t) => handleChange("nome", t)}
            placeholder="Seu nome"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* 📧 EMAIL */}
        <View style={{ marginBottom: 10 }}>
          <Text style={label}>Email</Text>
          <TextInput
            style={input}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="email@email.com"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* 🔐 SENHA */}
        <Text style={label}>Senha</Text>
        <View style={{ position: "relative", marginBottom: 10 }}>
          <TextInput
            style={input}
            value={form.password}
            onChangeText={(t) => handleChange("password", t)}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity
            style={{ position: "absolute", right: 12, top: 12 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* 🔐 CONFIRMAR SENHA */}
        <Text style={label}>Confirmar Senha</Text>
        <TextInput
          style={input}
          value={form.confirmPassword}
          onChangeText={(t) =>
            handleChange("confirmPassword", t)
          }
          secureTextEntry={!showPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textLight}
        />

        {/* ❌ ERRO */}
        {error !== "" && (
          <Text
            style={{
              color: colors.danger,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            {error}
          </Text>
        )}

        {/* 🚀 BOTÃO */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <Text
            style={{
              color: colors.primaryDark,
              fontWeight: "bold",
            }}
          >
            Criar Conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
