import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import {
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebaseConfig";

import { uploadImagem } from "../services/uploadService";

import { useAuth } from "../context/AuthContext";

import AppText from "../components/AppText";

import { Colors } from "../styles/Colors";

export default function PerfilEditar({
  navigation,
}) {
  const insets = useSafeAreaInsets();

  const {
    user,
    nome: nomeContext,
    foto: fotoContext,
  } = useAuth();

  const [loading, setLoading] =
    useState(false);

  /* 👤 PERFIL */
  const [nome, setNome] = useState(
    nomeContext || ""
  );

  const [username, setUsername] =
    useState("");

  const [bio, setBio] = useState("");

  const [cidade, setCidade] =
    useState("");

  const [foto, setFoto] = useState(
    fotoContext || ""
  );

  const [telefone, setTelefone] =
    useState("");

  const [cpf, setCpf] = useState("");

  /* 🌐 REDES */
  const [instagram, setInstagram] =
    useState("");

  const [facebook, setFacebook] =
    useState("");

  const [threads, setThreads] =
    useState("");

  const [x, setX] = useState("");

  const [spotify, setSpotify] =
    useState("");

  const [tiktok, setTiktok] =
    useState("");

  const [website, setWebsite] =
    useState("");

  /* 🔄 LOAD */
  useEffect(() => {
    async function carregar() {
      try {
        const ref = doc(
          db,
          "users",
          user.uid
        );

        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setTelefone(
            data.telefone || ""
          );

          setCpf(data.cpf || "");

          setUsername(
            data.username || ""
          );

          setBio(data.bio || "");

          setCidade(
            data.cidade || ""
          );

          setInstagram(
            data.instagram || ""
          );

          setFacebook(
            data.facebook || ""
          );

          setThreads(
            data.threads || ""
          );

          setX(data.x || "");

          setSpotify(
            data.spotify || ""
          );

          setTiktok(
            data.tiktok || ""
          );

          setWebsite(
            data.website || ""
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (user) carregar();
  }, []);

  /* 📸 FOTO */
  async function escolherFoto() {
    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária"
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker.MediaTypeOptions
              .Images,

          quality: 0.5,

          allowsEditing: true,

          aspect: [1, 1],
        }
      );

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  /* 💾 SAVE */
  async function salvar() {
    if (!nome.trim()) {
      Alert.alert(
        "Informe seu nome"
      );

      return;
    }

    try {
      setLoading(true);

      let fotoFinal = foto;

      if (
        foto &&
        !foto.startsWith("https")
      ) {
        fotoFinal =
          await uploadImagem(
            foto,
            user.uid
          );
      }

      await updateProfile(
        auth.currentUser,
        {
          displayName: nome,
          photoURL: fotoFinal,
        }
      );

      const ref = doc(
        db,
        "users",
        user.uid
      );

      await setDoc(
        ref,
        {
          nome,
          username,
          bio,
          cidade,

          telefone,
          cpf,

          instagram,
          facebook,
          threads,
          x,
          spotify,
          tiktok,
          website,

          foto: fotoFinal,
          email: user.email,

          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert(
        "Sucesso",
        "Perfil atualizado!"
      );

      navigation.goBack();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  /* 🎨 INPUT */
  const renderInput = (
    icon,
    placeholder,
    value,
    setValue
  ) => (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={Colors.primary}
      />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={
          Colors.textMuted
        }
        value={value}
        onChangeText={setValue}
        style={styles.input}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🌌 HEADER */}
      <LinearGradient
        colors={[
          Colors.background,
          Colors.surface,
        ]}
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <AppText
          style={styles.headerTitle}
        >
          Editar Perfil
        </AppText>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 👤 AVATAR */}
        <View style={styles.avatarArea}>
          <View style={styles.avatarGlow} />

          <Image
            source={{
              uri:
                foto ||
                "https://i.pravatar.cc/200",
            }}
            style={styles.avatar}
          />

          <TouchableOpacity
            onPress={escolherFoto}
            style={styles.camera}
          >
            <MaterialCommunityIcons
              name="camera"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* 📝 CARD */}
        <View style={styles.card}>
          {renderInput(
            "account",
            "Nome",
            nome,
            setNome
          )}

          {renderInput(
            "at",
            "Username",
            username,
            setUsername
          )}

          {renderInput(
            "map-marker",
            "Cidade",
            cidade,
            setCidade
          )}

          {renderInput(
            "phone",
            "Telefone",
            telefone,
            setTelefone
          )}

          {renderInput(
            "card-account-details",
            "CPF",
            cpf,
            setCpf
          )}

          {/* 🧾 BIO */}
          <View
            style={styles.bioWrapper}
          >
            <TextInput
              placeholder="Bio"
              placeholderTextColor={
                Colors.textMuted
              }
              multiline
              value={bio}
              onChangeText={setBio}
              style={styles.bio}
            />
          </View>

          {/* 🌐 REDES */}
          <AppText
            style={styles.section}
          >
            Redes Sociais
          </AppText>

          {renderInput(
            "instagram",
            "Instagram",
            instagram,
            setInstagram
          )}

          {renderInput(
            "facebook",
            "Facebook",
            facebook,
            setFacebook
          )}

          {renderInput(
            "threads",
            "Threads",
            threads,
            setThreads
          )}

          {renderInput(
            "twitter",
            "X / Twitter",
            x,
            setX
          )}

          {renderInput(
            "spotify",
            "Spotify",
            spotify,
            setSpotify
          )}

          {renderInput(
            "music-note",
            "TikTok",
            tiktok,
            setTiktok
          )}

          {renderInput(
            "web",
            "Website",
            website,
            setWebsite
          )}

          {/* 🚀 BTN */}
          <TouchableOpacity
            onPress={salvar}
            disabled={loading}
            style={styles.button}
          >
            <LinearGradient
              colors={[
                Colors.primary,
                Colors.primaryLight,
              ]}
              style={styles.gradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText
                  style={
                    styles.buttonText
                  }
                >
                  Salvar Alterações
                </AppText>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View
          style={{ height: 120 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,

    flexDirection: "row",

    alignItems: "center",

    gap: 14,
  },

  headerTitle: {
    color: Colors.textPrimary,

    fontSize: 20,

    fontWeight: "bold",
  },

  avatarArea: {
    alignItems: "center",

    marginTop: 24,
  },

  avatarGlow: {
    position: "absolute",

    width: 140,
    height: 140,

    borderRadius: 70,

    backgroundColor:
      "rgba(108,92,231,0.25)",

    shadowColor: Colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 24,
  },

  avatar: {
    width: 120,
    height: 120,

    borderRadius: 60,

    borderWidth: 3,

    borderColor: Colors.primary,
  },

  camera: {
    position: "absolute",

    bottom: 0,
    right: 120,

    backgroundColor:
      Colors.primary,

    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: "center",

    justifyContent: "center",
  },

  card: {
    margin: 16,

    padding: 18,

    borderRadius: 28,

    backgroundColor:
      Colors.surface,

    borderWidth: 1,

    borderColor: Colors.border,
  },

  inputWrapper: {
    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    backgroundColor:
      Colors.card,

    paddingHorizontal: 14,

    borderRadius: 18,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: Colors.border,
  },

  input: {
    flex: 1,

    color: Colors.textPrimary,

    paddingVertical: 16,
  },

  bioWrapper: {
    backgroundColor:
      Colors.card,

    borderRadius: 18,

    borderWidth: 1,

    borderColor: Colors.border,

    padding: 14,

    marginBottom: 20,
  },

  bio: {
    minHeight: 90,

    color: Colors.textPrimary,

    textAlignVertical: "top",
  },

  section: {
    fontSize: 16,

    fontWeight: "bold",

    color: Colors.textPrimary,

    marginBottom: 14,

    marginTop: 10,
  },

  button: {
    marginTop: 12,

    borderRadius: 18,

    overflow: "hidden",
  },

  gradient: {
    paddingVertical: 16,

    alignItems: "center",

    borderRadius: 18,
  },

  buttonText: {
    color: "#fff",

    fontWeight: "bold",

    fontSize: 16,
  },
});