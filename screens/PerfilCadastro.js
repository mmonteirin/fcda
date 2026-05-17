import React, { useState } from "react";

import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { MotiView } from "moti";

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

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [focusedInput, setFocusedInput] =
    useState(null);

  const handleChange = (field, value) => {
    let newValue = value;

    if (field === "email") {
      newValue = value.trim().toLowerCase();
    }

    setForm({
      ...form,
      [field]: newValue,
    });
  };

  const isValidEmail = (email) =>
    /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setError("");

    const {
      nome,
      email,
      password,
      confirmPassword,
    } = form;

    if (
      !nome ||
      !email ||
      !password ||
      !confirmPassword
    ) {
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

    try {
      setLoading(true);

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
    } catch (e) {
      setError("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/fundoTelaLogin.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.88)",
          "rgba(20,20,40,0.72)",
          "rgba(0,0,0,0.94)",
        ]}
        style={styles.overlay}
      >

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.scroll
            }
          >

            {/* VOLTAR */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Feather
                name="arrow-left"
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>

            {/* HEADER */}
            <MotiView
              from={{
                opacity: 0,
                translateY: -30,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: "timing",
                duration: 700,
              }}
              style={styles.logoContainer}
            >

              <LinearGradient
                colors={[
                  colors.primary,
                  "#7B5CFF",
                ]}
                style={styles.logoCircle}
              >
                <Feather
                  name="user-plus"
                  size={34}
                  color="#FFF"
                />
              </LinearGradient>

              <Text style={styles.title}>
                Criar Conta
              </Text>

              <Text style={styles.subtitle}>
                Cadastre-se para acessar
                eventos, experiências e
                serviços incríveis
              </Text>

            </MotiView>

            {/* CARD */}
            <MotiView
              from={{
                opacity: 0,
                translateY: 40,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: "timing",
                duration: 800,
              }}
            >

              <BlurView
                intensity={65}
                tint="dark"
                style={styles.card}
              >

                {/* NOME */}
                <Text style={styles.label}>
                  Nome
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    focusedInput ===
                      "nome" &&
                      styles.inputFocused,
                  ]}
                >

                  <Feather
                    name="user"
                    size={18}
                    color={
                      colors.textLight
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={form.nome}
                    onChangeText={(t) =>
                      handleChange(
                        "nome",
                        t
                      )
                    }
                    placeholder="Seu nome"
                    placeholderTextColor={
                      colors.textLight
                    }
                    onFocus={() =>
                      setFocusedInput(
                        "nome"
                      )
                    }
                    onBlur={() =>
                      setFocusedInput(
                        null
                      )
                    }
                  />

                </View>

                {/* EMAIL */}
                <Text style={styles.label}>
                  Email
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    focusedInput ===
                      "email" &&
                      styles.inputFocused,
                  ]}
                >

                  <Feather
                    name="mail"
                    size={18}
                    color={
                      colors.textLight
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={form.email}
                    onChangeText={(t) =>
                      handleChange(
                        "email",
                        t
                      )
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="email@email.com"
                    placeholderTextColor={
                      colors.textLight
                    }
                    onFocus={() =>
                      setFocusedInput(
                        "email"
                      )
                    }
                    onBlur={() =>
                      setFocusedInput(
                        null
                      )
                    }
                  />

                </View>

                {/* SENHA */}
                <Text style={styles.label}>
                  Senha
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    focusedInput ===
                      "password" &&
                      styles.inputFocused,
                  ]}
                >

                  <Feather
                    name="lock"
                    size={18}
                    color={
                      colors.textLight
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={form.password}
                    onChangeText={(t) =>
                      handleChange(
                        "password",
                        t
                      )
                    }
                    secureTextEntry={
                      !showPassword
                    }
                    placeholder="••••••••"
                    placeholderTextColor={
                      colors.textLight
                    }
                    onFocus={() =>
                      setFocusedInput(
                        "password"
                      )
                    }
                    onBlur={() =>
                      setFocusedInput(
                        null
                      )
                    }
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    <Feather
                      name={
                        showPassword
                          ? "eye"
                          : "eye-off"
                      }
                      size={18}
                      color={
                        colors.primary
                      }
                    />
                  </TouchableOpacity>

                </View>

                {/* CONFIRMAR SENHA */}
                <Text style={styles.label}>
                  Confirmar Senha
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    focusedInput ===
                      "confirmPassword" &&
                      styles.inputFocused,
                  ]}
                >

                  <Feather
                    name="shield"
                    size={18}
                    color={
                      colors.textLight
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={
                      form.confirmPassword
                    }
                    onChangeText={(t) =>
                      handleChange(
                        "confirmPassword",
                        t
                      )
                    }
                    secureTextEntry={
                      !showPassword
                    }
                    placeholder="••••••••"
                    placeholderTextColor={
                      colors.textLight
                    }
                    onFocus={() =>
                      setFocusedInput(
                        "confirmPassword"
                      )
                    }
                    onBlur={() =>
                      setFocusedInput(
                        null
                      )
                    }
                  />

                </View>

                {/* ERRO */}
                {error !== "" && (
                  <Text style={styles.error}>
                    {error}
                  </Text>
                )}

                {/* BOTÃO */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={
                    styles.buttonWrapper
                  }
                >

                  <LinearGradient
                    colors={[
                      colors.primary,
                      "#7B5CFF",
                    ]}
                    start={{
                      x: 0,
                      y: 0,
                    }}
                    end={{
                      x: 1,
                      y: 1,
                    }}
                    style={styles.button}
                  >

                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text
                        style={
                          styles.buttonText
                        }
                      >
                        Criar Conta
                      </Text>
                    )}

                  </LinearGradient>

                </TouchableOpacity>

                {/* LOGIN */}
                <View style={styles.footer}>
                  <Text
                    style={
                      styles.footerText
                    }
                  >
                    Já possui conta?
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "Login"
                      )
                    }
                  >
                    <Text
                      style={
                        styles.loginLink
                      }
                    >
                      Entrar
                    </Text>
                  </TouchableOpacity>
                </View>

              </BlurView>

            </MotiView>

          </ScrollView>

        </KeyboardAvoidingView>

      </LinearGradient>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",

    padding: 22,
    paddingBottom: 40,
  },

  /* BACK */
  backButton: {
    width: 44,
    height: 44,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",

    marginBottom: 25,
  },

  /* HEADER */
  logoContainer: {
    alignItems: "center",

    marginBottom: 35,
  },

  logoCircle: {
    width: 92,
    height: 92,

    borderRadius: 50,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 22,

    elevation: 12,
  },

  title: {
    color: "#FFF",

    fontSize: 30,
    fontWeight: "bold",

    marginTop: 18,
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.72)",

    textAlign: "center",

    marginTop: 10,

    fontSize: 14,

    lineHeight: 22,

    paddingHorizontal: 20,
  },

  /* CARD */
  card: {
    overflow: "hidden",

    borderRadius: 28,

    padding: 24,

    backgroundColor:
      "rgba(20,20,20,0.35)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  /* LABEL */
  label: {
    color:
      "rgba(255,255,255,0.75)",

    marginBottom: 8,

    marginLeft: 4,

    fontSize: 13,
  },

  /* INPUT */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderRadius: 18,

    paddingHorizontal: 14,

    marginBottom: 18,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  inputFocused: {
    borderColor: colors.primary,

    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 5,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    color: "#FFF",

    paddingVertical: 16,

    fontSize: 15,
  },

  /* ERRO */
  error: {
    color: "#FF6B6B",

    textAlign: "center",

    marginTop: 5,
    marginBottom: 12,
  },

  /* BUTTON */
  buttonWrapper: {
    marginTop: 12,

    borderRadius: 18,

    overflow: "hidden",
  },

  button: {
    paddingVertical: 17,

    alignItems: "center",

    borderRadius: 18,
  },

  buttonText: {
    color: "#FFF",

    fontWeight: "bold",

    fontSize: 16,

    letterSpacing: 0.5,
  },

  /* FOOTER */
  footer: {
    flexDirection: "row",

    justifyContent: "center",

    gap: 6,

    marginTop: 24,
  },

  footerText: {
    color:
      "rgba(255,255,255,0.65)",
  },

  loginLink: {
    color: colors.primary,

    fontWeight: "bold",
  },
});