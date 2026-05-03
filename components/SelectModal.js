import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SelectModal({
  label,
  value,
  options = [],
  onSelect,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  /* 🔥 ANIMAÇÃO iOS STYLE */
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(40);
      scale.setValue(0.95);
      setSearch("");
    }
  }, [visible]);

  /* 🔍 FILTRO */
  const filtered = useMemo(() => {
    return options.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <>
      {/* LABEL */}
      <Text style={{ color: "#fff", marginBottom: 8 }}>
        {label}
      </Text>

      {/* INPUT */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: "#13291d",
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#1f3d2a",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: value ? "#fff" : "#777" }}>
          {value || "Selecione..."}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color="#3cc962"
        />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={visible} transparent animationType="none">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: "#13291d",
              borderRadius: 20,
              padding: 15,
              opacity,
              transform: [{ translateY }, { scale }],
              maxHeight: "70%",
            }}
          >
            {/* 🔍 BUSCA */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#0c1f11",
                borderRadius: 12,
                paddingHorizontal: 10,
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#777"
              />

              <TextInput
                placeholder="Buscar..."
                placeholderTextColor="#777"
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  color: "#fff",
                  padding: 10,
                  marginLeft: 6,
                }}
              />
            </View>

            {/* LISTA */}
            {filtered.map((item) => {
              const ativo = value === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 6,
                    backgroundColor: ativo ? "#3cc962" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: ativo ? "#0c1f11" : "#fff",
                      fontWeight: ativo ? "bold" : "normal",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* ❌ FECHAR */}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                marginTop: 10,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#aaa" }}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
