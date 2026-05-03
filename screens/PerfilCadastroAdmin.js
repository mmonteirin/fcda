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

export default function PerfilCadastroAdmin({ navigation }) {
  const { registerUser } = useCadastro();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
    areaAtuacao: "",
    localAtuacao: "",
    cnpj: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 máscara CNPJ
  const formatCNPJ = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);

    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleChange = (field, value) => {
    let newValue = value;

    if (field === "cnpj") newValue = formatCNPJ(value);
    if (field === "email") newValue = value.trim().toLowerCase();

    setForm({ ...form, [field]: newValue });
  };

  const handleSubmit = async () => {
    setError("");

    const {
      nome,
      email,
      password,
      confirmPassword,
      adminCode,
      areaAtuacao,
      localAtuacao,
      cnpj,
    } = form;

    if (
      !nome ||
      !email ||
      !password ||
      !confirmPassword ||
      !adminCode ||
      !areaAtuacao ||
      !localAtuacao ||
      !cnpj
    ) {
      setError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Senhas não coincidem");
      return;
    }

    if (adminCode !== "123456") {
      setError("Código inválido");
      return;
    }

    const response = await registerUser({
      nome,
      email,
      password,
      role: "admin",
      areaAtuacao,
      localAtuacao,
      cnpj,
    });

    if (response.success) {
      alert("Sucesso!");
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
        {/* 🔙 voltar */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather
            name="chevron-left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* título */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginVertical: 12,
          }}
        >
          Cadastro de Organizador
        </Text>

        {/* nome */}
        <View style={{ marginBottom: 10 }}>
          <Text style={label}>Nome</Text>
          <TextInput
            style={input}
            value={form.nome}
            onChangeText={(t) => handleChange("nome", t)}
            placeholder="Nome"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* email */}
        <View style={{ marginBottom: 10 }}>
          <Text style={label}>Email</Text>
          <TextInput
            style={input}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* área + local */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={label}>Área</Text>
            <TextInput
              style={input}
              value={form.areaAtuacao}
              onChangeText={(t) =>
                handleChange("areaAtuacao", t)
              }
              placeholder="Área"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={label}>Local</Text>
            <TextInput
              style={input}
              value={form.localAtuacao}
              onChangeText={(t) =>
                handleChange("localAtuacao", t)
              }
              placeholder="Local"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        {/* CNPJ */}
        <View style={{ marginTop: 10 }}>
          <Text style={label}>CNPJ</Text>
          <TextInput
            style={input}
            value={form.cnpj}
            onChangeText={(t) => handleChange("cnpj", t)}
            keyboardType="numeric"
            maxLength={18}
            placeholder="00.000.000/0000-00"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* código */}
        <View style={{ marginTop: 10 }}>
          <Text style={label}>Código</Text>
          <TextInput
            style={input}
            value={form.adminCode}
            onChangeText={(t) =>
              handleChange("adminCode", t)
            }
            placeholder="Código"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* senha */}
        <Text style={[label, { marginTop: 10 }]}>Senha</Text>
        <View style={{ position: "relative" }}>
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

        {/* confirmar */}
        <Text style={[label, { marginTop: 10 }]}>
          Confirmar Senha
        </Text>

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

        {/* erro */}
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

        {/* botão */}
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
            Criar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
