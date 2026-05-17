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

export default function PerfilCadastroAdmin({
  navigation,
}) {
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

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [focusedInput, setFocusedInput] =
    useState(null);

  // 🔥 máscara CNPJ
  const formatCNPJ = (value) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 14);

    return digits
      .replace(
        /^(\d{2})(\d)/,
        "$1.$2"
      )
      .replace(
        /^(\d{2})\.(\d{3})(\d)/,
        "$1.$2.$3"
      )
      .replace(
        /\.(\d{3})(\d)/,
        ".$1/$2"
      )
      .replace(
        /(\d{4})(\d)/,
        "$1-$2"
      );
  };

  const handleChange = (
    field,
    value
  ) => {
    let newValue = value;

    if (field === "cnpj") {
      newValue = formatCNPJ(value);
    }

    if (field === "email") {
      newValue = value
        .trim()
        .toLowerCase();
    }

    setForm({
      ...form,
      [field]: newValue,
    });
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
      setError(
        "Preencha todos os campos"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Senhas não coincidem"
      );
      return;
    }

    if (adminCode !== "123456") {
      setError("Código inválido");
      return;
    }

    try {
      setLoading(true);

      const response =
        await registerUser({
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
    } catch (e) {
      setError(
        "Erro ao criar organizador"
      );
    } finally {
      setLoading(false);
    }
  };

  // INPUT COMPONENT
  const renderInput = ({
    label,
    field,
    placeholder,
    icon,
    secure = false,
    keyboardType = "default",
    maxLength,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,

          focusedInput === field &&
            styles.inputFocused,
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={
            "rgba(255,255,255,0.55)"
          }
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          value={form[field]}
          onChangeText={(t) =>
            handleChange(field, t)
          }
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.38)"
          secureTextEntry={
            secure && !showPassword
          }
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() =>
            setFocusedInput(field)
          }
          onBlur={() =>
            setFocusedInput(null)
          }
        />

        {secure && (
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
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/fundoTelaLogin.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      {/* OVERLAY */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.90)",
          "rgba(15,15,35,0.72)",
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
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.scroll
            }
          >

            {/* BACK */}
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
                  name="briefcase"
                  size={34}
                  color="#FFF"
                />
              </LinearGradient>

              <Text style={styles.title}>
                Cadastro de Organizador
              </Text>

              <Text
                style={styles.subtitle}
              >
                Crie sua conta como
                organizador e gerencie
                eventos profissionais
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
                duration: 850,
              }}
            >

              <BlurView
                intensity={65}
                tint="dark"
                style={styles.card}
              >

                {renderInput({
                  label: "Nome",
                  field: "nome",
                  placeholder:
                    "Nome do organizador",
                  icon: "user",
                })}

                {renderInput({
                  label: "Email",
                  field: "email",
                  placeholder:
                    "email@email.com",
                  icon: "mail",
                  keyboardType:
                    "email-address",
                })}

                {/* ROW */}
                <View
                  style={styles.row}
                >

                  <View
                    style={{ flex: 1 }}
                  >
                    {renderInput({
                      label: "Área",
                      field:
                        "areaAtuacao",
                      placeholder:
                        "Eventos",
                      icon: "grid",
                    })}
                  </View>

                  <View
                    style={{ flex: 1 }}
                  >
                    {renderInput({
                      label: "Local",
                      field:
                        "localAtuacao",
                      placeholder:
                        "Fortaleza",
                      icon: "map-pin",
                    })}
                  </View>

                </View>

                {renderInput({
                  label: "CNPJ",
                  field: "cnpj",
                  placeholder:
                    "00.000.000/0000-00",
                  icon: "file-text",
                  keyboardType:
                    "numeric",
                  maxLength: 18,
                })}

                {renderInput({
                  label:
                    "Código Administrativo",
                  field: "adminCode",
                  placeholder:
                    "Código de acesso",
                  icon: "shield",
                })}

                {renderInput({
                  label: "Senha",
                  field: "password",
                  placeholder:
                    "••••••••",
                  icon: "lock",
                  secure: true,
                })}

                {renderInput({
                  label:
                    "Confirmar Senha",
                  field:
                    "confirmPassword",
                  placeholder:
                    "••••••••",
                  icon: "check-circle",
                  secure: true,
                })}

                {/* ERROR */}
                {error !== "" && (
                  <Text
                    style={
                      styles.error
                    }
                  >
                    {error}
                  </Text>
                )}

                {/* BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleSubmit}
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
                        Criar Organizador
                      </Text>
                    )}

                  </LinearGradient>

                </TouchableOpacity>

                {/* FOOTER */}
                <View
                  style={styles.footer}
                >
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

    padding: 22,
    paddingBottom: 40,
  },

  /* BACK */
  backButton: {
    width: 46,
    height: 46,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",

    marginBottom: 24,
  },

  /* HEADER */
  logoContainer: {
    alignItems: "center",

    marginBottom: 35,
  },

  logoCircle: {
    width: 95,
    height: 95,

    borderRadius: 50,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,

    elevation: 14,
  },

  title: {
    color: "#FFF",

    fontSize: 28,
    fontWeight: "bold",

    marginTop: 18,

    textAlign: "center",
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.72)",

    textAlign: "center",

    marginTop: 10,

    fontSize: 14,

    lineHeight: 22,

    paddingHorizontal: 12,
  },

  /* CARD */
  card: {
    overflow: "hidden",

    borderRadius: 30,

    padding: 24,

    backgroundColor:
      "rgba(20,20,20,0.35)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  /* INPUT */
  inputGroup: {
    marginBottom: 16,
  },

  label: {
    color:
      "rgba(255,255,255,0.75)",

    marginBottom: 8,

    marginLeft: 4,

    fontSize: 13,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderRadius: 18,

    paddingHorizontal: 14,

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

  row: {
    flexDirection: "row",
    gap: 12,
  },

  /* ERROR */
  error: {
    color: "#FF6B6B",

    textAlign: "center",

    marginTop: 5,
    marginBottom: 12,
  },

  /* BUTTON */
  buttonWrapper: {
    marginTop: 8,

    borderRadius: 18,

    overflow: "hidden",
  },

  button: {
    paddingVertical: 17,

    borderRadius: 18,

    alignItems: "center",
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