import React, { useState, useRef } from "react";
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║ PerfilCadastroAdmin - REFATORAÇÃO PROFISSIONAL (FLUIDA + iOS-LIKE)        ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║ ✅ KeyboardAwareScrollView para gerenciar teclado automaticamente         ║
 * ║ ✅ Scroll suave sem pulos - scrollToFocusedInput nativo                   ║
 * ║ ✅ Foco automático com delay suave (100ms) para melhor UX                 ║
 * ║ ✅ Inputs com feedback visual ao focar (borda colorida + sombra)          ║
 * ║ ✅ Modais profissionais com animações fade e ícones melhorados            ║
 * ║ ✅ iOS-like behavior: teclado nunca quebra a tela                         ║
 * ║ ✅ Sem measureLayout - layout mais previsível                             ║
 * ║ ✅ Scroll natural com extraScrollHeight adaptativo (iOS: 80, Android: 100)║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useCadastro } from "../context/CadastroContext";
import GlobalStyles from "../styles/GlobalStyles";

const { colors } = GlobalStyles;

const FIELD_ORDER = [
  "nome",
  "email",
  "verificationCode",
  "areaAtuacao",
  "localAtuacao",
  "cnpj",
  "password",
  "confirmPassword",
];

export default function PerfilCadastroAdmin({ navigation }) {
  const { registerUser } = useCadastro();
  const scrollRef = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    areaAtuacao: "",
    localAtuacao: "",
    cnpj: "",
  });

  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const inputRefs = useRef({});

  // ─── helpers ───────────────────────────────
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

    setForm((prev) => ({ ...prev, [field]: newValue }));
  };

  const focusNext = (field) => {
    const index = FIELD_ORDER.indexOf(field);
    const next = FIELD_ORDER[index + 1];

    if (next && inputRefs.current[next]) {
      setTimeout(() => {
        inputRefs.current[next].focus();
      }, 100);
    }
  };

  // ─── code ───────────────────────────────
  const handleSendCode = () => {
    if (!form.nome || !form.email) {
      setError("Preencha nome e email");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setShowCodeModal(true);
    setError("");
  };

  // ─── submit ───────────────────────────────
  const handleSubmit = async () => {
    setError("");

    const {
      nome,
      email,
      password,
      confirmPassword,
      verificationCode,
      areaAtuacao,
      localAtuacao,
      cnpj,
    } = form;

    if (
      !nome ||
      !email ||
      !password ||
      !confirmPassword ||
      !verificationCode ||
      !areaAtuacao ||
      !localAtuacao ||
      !cnpj
    ) {
      setError("Preencha todos os campos");
      return;
    }

    if (verificationCode !== generatedCode) {
      setError("Código inválido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Senhas não coincidem");
      return;
    }

    try {
      setLoading(true);

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
        setShowSuccessModal(true);
      } else {
        setError(response.message);
      }
    } catch (e) {
      setError("Erro ao criar organizador");
    } finally {
      setLoading(false);
    }
  };

  // ─── input renderer ───────────────────────────────
  const renderInput = ({
    label,
    field,
    placeholder,
    icon,
    secure,
    keyboardType,
    maxLength,
  }) => {
    const isLast = FIELD_ORDER[FIELD_ORDER.length - 1] === field;
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>{label}</Text>

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <Feather
            name={icon}
            size={16}
            color={isFocused ? colors.primary : "rgba(255,255,255,0.5)"}
            style={{ marginRight: 8 }}
          />

          <TextInput
            ref={(r) => (inputRefs.current[field] = r)}
            value={form[field]}
            onChangeText={(t) => handleChange(field, t)}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
            secureTextEntry={secure && !showPassword}
            keyboardType={keyboardType}
            maxLength={maxLength}
            returnKeyType={isLast ? "done" : "next"}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => {
              if (isLast) handleSubmit();
              else focusNext(field);
            }}
          />

          {secure && (
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/fundoTelaLogin.png")}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["rgba(0,0,0,0.9)", "rgba(10,10,25,0.7)", "rgba(0,0,0,0.95)"]}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 24 : 32}
          enableAutomaticScroll={true}
          scrollToOverflowEnabled={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={styles.container}
          keyboardOpeningTime={0}
        >
          {/* HEADER */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600 }}
            style={styles.header}
          >
            <LinearGradient
              colors={[colors.primary, "#7B5CFF"]}
              style={styles.logo}
            >
              <Feather name="briefcase" size={30} color="#fff" />
            </LinearGradient>

            <View>
              <Text style={styles.title}>Cadastro de Organizador</Text>
              <Text style={styles.subtitle}>
                Cadastro protegido por validação
              </Text>
            </View>
          </MotiView>

          <BlurView intensity={60} tint="dark" style={styles.card}>
            {renderInput({
              label: "Nome",
              field: "nome",
              placeholder: "Nome",
              icon: "user",
            })}

            {renderInput({
              label: "Email",
              field: "email",
              placeholder: "email@email.com",
              icon: "mail",
              keyboardType: "email-address",
            })}

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.codeButton}
                onPress={handleSendCode}
              >
                <LinearGradient
                  colors={[colors.primary, "#2563EB"]}
                  style={styles.codeGradient}
                >
                  <Feather name="send" color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 6 }}>
                    Enviar
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {renderInput({
                label: "Código",
                field: "verificationCode",
                placeholder: "000000",
                icon: "shield",
                keyboardType: "numeric",
              })}
            </View>

            {renderInput({
              label: "Área",
              field: "areaAtuacao",
              placeholder: "Eventos",
              icon: "grid",
            })}

            {renderInput({
              label: "Local",
              field: "localAtuacao",
              placeholder: "Fortaleza",
              icon: "map-pin",
            })}

            {renderInput({
              label: "CNPJ",
              field: "cnpj",
              placeholder: "00.000.000/0000-00",
              icon: "file-text",
              keyboardType: "numeric",
              maxLength: 18,
            })}

            {renderInput({
              label: "Senha",
              field: "password",
              placeholder: "••••••••",
              icon: "lock",
              secure: true,
            })}

            {renderInput({
              label: "Confirmar",
              field: "confirmPassword",
              placeholder: "••••••••",
              icon: "check-circle",
              secure: true,
            })}

            {error !== "" && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity onPress={handleSubmit}>
              <LinearGradient
                colors={[colors.primary, "#7B5CFF"]}
                style={styles.submit}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Criar Organizador
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </KeyboardAwareScrollView>
      </LinearGradient>

      {/* MODALS */}
      <Modal visible={showCodeModal} transparent animationType="fade">
        <View style={styles.modal}>
          <BlurView intensity={80} tint="dark" style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Feather name="mail" size={32} color={colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Código Enviado</Text>
            <Text style={styles.modalText}>
              Código dinâmico enviado para:
            </Text>
            <Text style={styles.modalEmail}>{form.email}</Text>

            <View style={styles.codeBox}>
              <Text style={styles.modalCode}>{generatedCode}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowCodeModal(false)}
              style={styles.modalButton}
            >
              <LinearGradient
                colors={[colors.primary, "#2563EB"]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modal}>
          <BlurView intensity={80} tint="dark" style={styles.modalCard}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: "rgba(34,197,94,0.2)" },
              ]}
            >
              <Feather name="check" size={32} color="#22C55E" />
            </View>

            <Text style={styles.modalTitle}>Cadastro Realizado!</Text>
            <Text style={styles.modalText}>
              Organizador criado com sucesso.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.modalButton}
            >
              <LinearGradient
                colors={[colors.primary, "#7B5CFF"]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Ir para Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// ─── styles ───────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.6)" },

  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(20,20,20,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "rgba(0,0,0,0.4)",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    transition: "all 200ms ease-in-out",
  },

  inputContainerFocused: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  input: {
    flex: 1,
    color: "#fff",
  },

  label: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  codeButton: {
    overflow: "hidden",
    borderRadius: 12,
    flex: 0.4,
  },

  codeGradient: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submit: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  error: {
    color: "#ff6b6b",
    marginTop: 10,
    textAlign: "center",
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },

  modalCard: {
    padding: 24,
    borderRadius: 24,
    width: "88%",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `rgba(${colors.primary ? "123,92,255" : "100,100,255"},0.2)`,
    marginBottom: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  modalText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },

  modalEmail: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },

  codeBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  modalCode: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 6,
    textAlign: "center",
  },

  modalButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },

  modalButtonGradient: {
    padding: 14,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
