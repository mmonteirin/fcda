import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function ResetPassword({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      alert("Digite um email válido");
      return;
    }

    try {
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
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <AppText style={styles.title}>
          Recuperar Senha
        </AppText>

        <AppText style={styles.subtitle}>
          Receba um link para redefinir sua senha
        </AppText>
      </LinearGradient>

      {/* CONTEÚDO */}
      <View style={styles.content}>

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <Feather name="mail" size={18} color={Colors.primary} />

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@email.com"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* BOTÃO */}
        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.button}
        >
          <AppText style={styles.buttonText}>
            Enviar link de recuperação
          </AppText>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

/* 🎨 PADRÃO GLOBAL */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 5,
  },

  content: {
    padding: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    flex: 1,
    color: Colors.textPrimary,
    marginLeft: 10,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
