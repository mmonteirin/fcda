import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function ResetPassword({ navigation }) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      alert("Digite um email válido");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      alert("Email enviado! Verifique sua caixa 📩");

      navigation.goBack();
    } catch (error) {
      console.log(error);

      if (error.code === "auth/user-not-found") {
        alert("Usuário não encontrado");
      } else if (error.code === "auth/invalid-email") {
        alert("Email inválido");
      } else {
        alert("Erro ao enviar email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* 🔥 BACKGROUND */}
      <LinearGradient
        colors={[
          "#17122B",
          "#111018",
          Colors.background,
        ]}
        style={styles.background}
      />

      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[
          "rgba(108,92,231,0.20)",
          "transparent",
        ]}
        style={[
          styles.header,
          { paddingTop: insets.top + 10 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Feather
            name="chevron-left"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {/* ICON */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[
              Colors.primary,
              "#7C6CFF",
            ]}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons
              name="lock-reset"
              size={34}
              color="#fff"
            />
          </LinearGradient>
        </View>

        {/* TEXTOS */}
        <AppText style={styles.title}>
          Recuperar Senha
        </AppText>

        <AppText style={styles.subtitle}>
          Digite seu email para receber{"\n"}
          o link de redefinição 🔐
        </AppText>
      </LinearGradient>

      {/* CARD */}
      <View style={styles.content}>
        <BlurView
          intensity={40}
          tint="dark"
          style={styles.card}
        >
          {/* LABEL */}
          <AppText style={styles.label}>
            Seu email
          </AppText>

          {/* INPUT */}
          <View
            style={[
              styles.inputContainer,
              focused && styles.inputFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={
                focused
                  ? Colors.primary
                  : Colors.textMuted
              }
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@email.com"
              placeholderTextColor={
                Colors.textMuted
              }
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>

          {/* INFO */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={Colors.primary}
            />

            <AppText style={styles.infoText}>
              Você receberá um email seguro para
              redefinir sua senha.
            </AppText>
          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleResetPassword}
            disabled={loading}
            style={[
              styles.button,
              loading && { opacity: 0.7 },
            ]}
          >
            <LinearGradient
              colors={[
                Colors.primary,
                "#7C6CFF",
              ]}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="send"
                    size={18}
                    color="#fff"
                  />

                  <AppText
                    style={styles.buttonText}
                  >
                    Enviar recuperação
                  </AppText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* FOOTER */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.footerButton}
          >
            <AppText style={styles.footerText}>
              Voltar para login
            </AppText>
          </TouchableOpacity>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    alignItems: "center",
  },

  backButton: {
    alignSelf: "flex-start",
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 30,
  },

  iconContainer: {
    marginBottom: 22,
  },

  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    fontSize: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    marginTop: -20,
  },

  card: {
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  label: {
    color: Colors.textSecondary,
    marginBottom: 12,
    fontSize: 13,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor:
      "rgba(108,92,231,0.08)",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 12,
    fontSize: 15,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor:
      "rgba(108,92,231,0.08)",
  },

  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    marginLeft: 10,
    lineHeight: 20,
    fontSize: 13,
  },

  button: {
    marginTop: 24,
    borderRadius: 18,
    overflow: "hidden",
  },

  buttonGradient: {
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },

  footerButton: {
    alignItems: "center",
    marginTop: 22,
  },

  footerText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});