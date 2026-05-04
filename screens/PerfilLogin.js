import React, { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppText from "../components/AppText";
import { Colors } from "../styles/Colors";

export default function PerfilLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasEmptyField, setHasEmptyField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    const emptyField = [email, password].some((f) => f.trim() === "");
    setHasEmptyField(emptyField);

    if (emptyField) return;

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("Usuário não encontrado");
      } else if (error.code === "auth/wrong-password") {
        alert("Senha incorreta");
      } else {
        alert("Erro ao fazer login");
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* 🔥 HEADER */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}
      >
        <AppText style={styles.title}>
          Bem-vindo 👋
        </AppText>

        <AppText style={styles.subtitle}>
          Acesse sua conta
        </AppText>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>

        {/* EMAIL */}
        <AppText style={styles.label}>Email</AppText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Digite seu email"
          placeholderTextColor={Colors.textMuted}
        />

        {/* SENHA */}
        <AppText style={styles.label}>Senha</AppText>

        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Digite sua senha"
            placeholderTextColor={Colors.textMuted}
          />

          <TouchableOpacity
            style={styles.eye}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ERRO */}
        {hasEmptyField && (
          <AppText style={styles.error}>
            Todos os campos são obrigatórios
          </AppText>
        )}

        {/* ESQUECI SENHA */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPassword")}
          style={styles.forgot}
        >
          <AppText style={styles.link}>
            Esqueci minha senha
          </AppText>
        </TouchableOpacity>

        {/* BOTÃO */}
        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <AppText style={styles.buttonText}>
            Entrar
          </AppText>
        </TouchableOpacity>

        {/* CADASTRO */}
        <View style={styles.row}>
          <AppText style={{ color: Colors.textSecondary }}>
            Não possui uma conta?
          </AppText>

          <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
            <AppText style={styles.linkBold}>
              Criar conta
            </AppText>
          </TouchableOpacity>
        </View>

        {/* DIVISOR */}
        <AppText style={styles.divider}>ou</AppText>

        {/* ORGANIZADOR */}
        <TouchableOpacity
          onPress={() => navigation.navigate("CadastroAdmin")}
        >
          <AppText style={styles.organizador}>
            Cadastrar como Organizador
          </AppText>
        </TouchableOpacity>

      </ScrollView>
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
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 5,
  },

  content: {
    padding: 20,
  },

  label: {
    color: Colors.textSecondary,
    marginBottom: 6,
  },

  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  eye: {
    position: "absolute",
    right: 15,
    top: 14,
  },

  error: {
    color: Colors.error,
    marginTop: 10,
  },

  forgot: {
    marginTop: 5,
    alignSelf: "flex-end",
  },

  link: {
    color: Colors.primary,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 6,
  },

  linkBold: {
    color: Colors.primary,
    fontWeight: "bold",
  },

  divider: {
    textAlign: "center",
    color: Colors.textMuted,
    marginVertical: 20,
  },

  organizador: {
    color: Colors.warning,
    textAlign: "center",
    fontWeight: "bold",
  },
});
