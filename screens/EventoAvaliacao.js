import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";
import GlobalStyles from "../styles/GlobalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";

const styles = GlobalStyles;

export default function EventoAvaliacao({ route, navigation }) {
  const { eventoId } = route.params;

  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const media =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((acc, item) => acc + item.nota, 0) /
          avaliacoes.length
        ).toFixed(1)
      : 0;

  const contarNotas = (nota) =>
    avaliacoes.filter((a) => a.nota === nota).length;

  const renderStars = (nota, size = 16) => (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text
          key={n}
          style={{
            color: n <= nota ? Colors.warning : Colors.border,
            fontSize: size,
          }}
        >
          ★
        </Text>
      ))}
    </View>
  );

  useEffect(() => {
    const q = query(
      collection(db, "eventos", eventoId, "avaliacoes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAvaliacoes(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const check = async () => {
      const q = query(
        collection(db, "eventos", eventoId, "avaliacoes"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);
      setJaAvaliou(!snap.empty);
    };

    check();
  }, []);

  const enviarAvaliacao = async () => {
    if (!notaSelecionada || !comentario || jaAvaliou) return;

    const user = auth.currentUser;

    await addDoc(
      collection(db, "eventos", eventoId, "avaliacoes"),
      {
        userId: user.uid,
        nome: user.displayName || "Anônimo",
        nota: notaSelecionada,
        comentario,
        foto: user.photoURL || "https://i.pravatar.cc/100",
        createdAt: serverTimestamp(),
      }
    );

    setComentario("");
    setNotaSelecionada(0);
    setJaAvaliou(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingSpinner}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginLeft: 10 }]}>
          Avaliações
        </Text>
      </View>

      {/* MÉDIA */}
      <View style={styles.eventCard}>
        <Text
          style={{
            color: Colors.warning,
            fontSize: 26,
            fontWeight: "bold",
          }}
        >
          {media} ⭐
        </Text>

        <Text style={{ color: Colors.textSecondary }}>
          {avaliacoes.length} avaliações
        </Text>
      </View>

      {/* DISTRIBUIÇÃO */}
      <View style={{ marginBottom: 15 }}>
        {[5, 4, 3, 2, 1].map((n) => {
          const total = avaliacoes.length || 1;
          const width = (contarNotas(n) / total) * 100;

          return (
            <View
              key={n}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              {renderStars(n)}

              <View
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: Colors.border,
                  borderRadius: 5,
                  marginLeft: 10,
                }}
              >
                <View
                  style={{
                    height: 6,
                    backgroundColor: Colors.primary,
                    borderRadius: 5,
                    width: `${width}%`,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* INPUT */}
      {!jaAvaliou && (
        <View style={styles.eventCard}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setNotaSelecionada(n)}>
                <Text
                  style={{
                    fontSize: 28,
                    color:
                      n <= notaSelecionada
                        ? Colors.warning
                        : Colors.border,
                  }}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              placeholder="Conte como foi sua experiência..."
              placeholderTextColor={Colors.textMuted}
              style={[styles.authInput, { flex: 1 }]}
              value={comentario}
              onChangeText={setComentario}
            />

            <TouchableOpacity
              style={[styles.button, { marginLeft: 10 }]}
              onPress={enviarAvaliacao}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {jaAvaliou && (
        <Text
          style={{
            color: Colors.warning,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Você já avaliou este evento ⭐
        </Text>
      )}

      {/* LISTA */}
      <FlatList
        data={avaliacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.localCard}>
            <Image source={{ uri: item.foto }} style={styles.localImage} />

            <View style={{ flex: 1 }}>
              <Text style={styles.localTitle}>{item.nome}</Text>
              {renderStars(item.nota)}
              <Text style={styles.localDescription}>
                {item.comentario}
              </Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
