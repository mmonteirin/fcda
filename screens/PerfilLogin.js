import React, { useState } from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { MotiView } from "moti";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function PerfilLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [hasEmptyField, setHasEmptyField] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [focusedInput, setFocusedInput] = useState(null);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    const emptyField = [email, password].some(
      (f) => f.trim() === ""
    );

    setHasEmptyField(emptyField);

    if (emptyField) return;

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      // Firebase v9+ unifica "user-not-found" e "wrong-password" em "invalid-credential"
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Email ou senha incorretos");
      } else if (error.code === "auth/too-many-requests") {
        alert("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        alert("Erro ao fazer login. Tente novamente.");
      }
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

      {/* OVERLAY */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.88)",
          "rgba(15,15,30,0.72)",
          "rgba(0,0,0,0.92)",
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
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >

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
                duration: 800,
              }}
              style={styles.logoContainer}
            >

              <LinearGradient
                colors={[
                  Colors.primary,
                  "#7B5CFF",
                ]}
                style={styles.logoCircle}
              >
                <Feather
                  name="zap"
                  size={38}
                  color="#FFF"
                />
              </LinearGradient>

              <AppText style={styles.appName}>
                MonitoraCult
              </AppText>

              <AppText style={styles.subtitle}>
                Entre na sua conta e descubra
                experiências incríveis
              </AppText>

            </MotiView>

            {/* CARD */}
            <MotiView
              from={{
                opacity: 0,
                translateY: 50,
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

                {/* EMAIL */}
                <AppText style={styles.label}>
                  Email
                </AppText>

                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "email" &&
                      styles.inputFocused,
                  ]}
                >
                  <Feather
                    name="mail"
                    size={20}
                    color={Colors.textMuted}
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Digite seu email"
                    placeholderTextColor={
                      Colors.textMuted
                    }
                    onFocus={() =>
                      setFocusedInput("email")
                    }
                    onBlur={() =>
                      setFocusedInput(null)
                    }
                  />
                </View>

                {/* SENHA */}
                <AppText style={styles.label}>
                  Senha
                </AppText>

                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "password" &&
                      styles.inputFocused,
                  ]}
                >
                  <Feather
                    name="lock"
                    size={20}
                    color={Colors.textMuted}
                    style={styles.icon}
                  />

                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Digite sua senha"
                    placeholderTextColor={
                      Colors.textMuted
                    }
                    onFocus={() =>
                      setFocusedInput("password")
                    }
                    onBlur={() =>
                      setFocusedInput(null)
                    }
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Feather
                      name={
                        showPassword
                          ? "eye"
                          : "eye-off"
                      }
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* ERRO */}
                {hasEmptyField && (
                  <AppText style={styles.error}>
                    Todos os campos são
                    obrigatórios
                  </AppText>
                )}

                {/* ESQUECI SENHA */}
                <TouchableOpacity
                  style={styles.forgot}
                  onPress={() =>
                    navigation.navigate(
                      "ResetPassword"
                    )
                  }
                >
                  <AppText style={styles.link}>
                    Esqueci minha senha
                  </AppText>
                </TouchableOpacity>

                {/* BOTÃO LOGIN */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={[
                      Colors.primary,
                      "#7B5CFF",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator
                        color="#FFF"
                      />
                    ) : (
                      <AppText
                        style={styles.buttonText}
                      >
                        Entrar
                      </AppText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* CADASTRO */}
                <View style={styles.row}>
                  <AppText
                    style={styles.rowText}
                  >
                    Não possui uma conta?
                  </AppText>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "Cadastro"
                      )
                    }
                  >
                    <AppText
                      style={styles.linkBold}
                    >
                      Criar conta
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* DIVIDER */}
                <View
                  style={
                    styles.dividerContainer
                  }
                >
                  <View style={styles.line} />

                  <AppText
                    style={styles.divider}
                  >
                    ou continue com
                  </AppText>

                  <View style={styles.line} />
                </View>

                {/* SOCIAL LOGIN */}
                <View
                  style={styles.socialContainer}
                >

                  <TouchableOpacity
                    style={styles.socialButton}
                  >
                    <Feather
                      name="chrome"
                      size={22}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                  >
                    <Feather
                      name="facebook"
                      size={22}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                  >
                    <Feather
                      name="twitter"
                      size={22}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                </View>

                {/* ORGANIZADOR */}
                <TouchableOpacity
                  style={
                    styles.organizadorButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      "CadastroAdmin"
                    )
                  }
                >

                  <Feather
                    name="briefcase"
                    size={18}
                    color={Colors.warning}
                  />

                  <AppText
                    style={styles.organizador}
                  >
                    Cadastrar como
                    Organizador
                  </AppText>

                </TouchableOpacity>

                {/* FOOTER */}
                <AppText style={styles.footer}>
                  Ao continuar você concorda
                  com nossos Termos de Uso e
                  Política de Privacidade.
                </AppText>

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
  },

  /* LOGO */
  logoContainer: {
    alignItems: "center",
    marginBottom: 38,
  },

  logoCircle: {
    width: 95,
    height: 95,
    borderRadius: 50,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
  },

  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 18,
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
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

  /* LABEL */
  label: {
    color: "rgba(255,255,255,0.75)",
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
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
    borderColor: Colors.primary,

    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 6,
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
    color: "#FF7070",
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },

  /* LINKS */
  forgot: {
    alignSelf: "flex-end",
  },

  link: {
    color: Colors.primary,
    fontWeight: "600",
  },

  linkBold: {
    color: Colors.primary,
    fontWeight: "bold",
  },

  /* BOTÃO */
  buttonWrapper: {
    marginTop: 28,
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

  /* ROW */
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",

    marginTop: 24,

    gap: 6,
  },

  rowText: {
    color: "rgba(255,255,255,0.65)",
  },

  /* DIVIDER */
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",

    marginVertical: 28,
  },

  line: {
    flex: 1,
    height: 1,

    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  divider: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },

  /* SOCIAL */
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,

    marginBottom: 28,
  },

  socialButton: {
    width: 58,
    height: 58,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.07)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",
  },

  /* ORGANIZADOR */
  organizadorButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 8,

    paddingVertical: 15,

    borderRadius: 18,

    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.06)",
  },

  organizador: {
    color: Colors.warning,
    fontWeight: "bold",
  },

  /* FOOTER */
  footer: {
    marginTop: 26,

    textAlign: "center",

    fontSize: 12,

    lineHeight: 20,

    color: "rgba(255,255,255,0.45)",
  },
});