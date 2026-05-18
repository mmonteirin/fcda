// components/ConfirmModal.js

import React from "react";

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { BlurView } from "expo-blur";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { MotiView } from "moti";

export default function ConfirmModal({
  visible,
  title = "Confirmar ação",
  message = "Deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "alert-circle",
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* BACKDROP */}
      <View style={styles.overlay}>
        <BlurView
          intensity={40}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        {/* CARD */}
        <MotiView
          from={{
            opacity: 0,
            scale: 0.9,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          transition={{
            type: "timing",
            duration: 250,
          }}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={[
              "rgba(20,20,35,0.96)",
              "rgba(14,14,28,0.98)",
            ]}
            style={styles.card}
          >
            {/* ICON */}
            <LinearGradient
              colors={
                danger
                  ? ["#EF4444", "#B91C1C"]
                  : ["#8B5CF6", "#5B21B6"]
              }
              style={styles.iconBox}
            >
              <MaterialCommunityIcons
                name={icon}
                size={34}
                color="#FFF"
              />
            </LinearGradient>

            {/* TITLE */}
            <Text style={styles.title}>
              {title}
            </Text>

            {/* MESSAGE */}
            <Text style={styles.message}>
              {message}
            </Text>

            {/* BUTTONS */}
            <View style={styles.actions}>
              {/* CANCEL */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cancelBtn}
                onPress={onCancel}
              >
                <Text
                  style={styles.cancelText}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* CONFIRM */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onConfirm}
              >
                <LinearGradient
                  colors={
                    danger
                      ? [
                          "#EF4444",
                          "#B91C1C",
                        ]
                      : [
                          "#8B5CF6",
                          "#5B21B6",
                        ]
                  }
                  style={styles.confirmBtn}
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {confirmText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 26,
  },

  modalContainer: {
    width: "100%",
  },

  card: {
    borderRadius: 34,

    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,

    alignItems: "center",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.08)",

    overflow: "hidden",
  },

  iconBox: {
    width: 78,
    height: 78,

    borderRadius: 28,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 22,
  },

  title: {
    color: "#FFF",

    fontSize: 23,

    fontFamily:
      "PoppinsBold",

    textAlign: "center",
  },

  message: {
    color:
      "rgba(255,255,255,0.68)",

    fontSize: 15,

    lineHeight: 24,

    textAlign: "center",

    marginTop: 12,

    fontFamily:
      "PoppinsRegular",
  },

  actions: {
    flexDirection: "row",

    marginTop: 30,

    width: "100%",
  },

  cancelBtn: {
    flex: 1,

    height: 56,

    borderRadius: 20,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.05)",
  },

  cancelText: {
    color: "#FFF",

    fontSize: 15,

    fontFamily:
      "PoppinsMedium",
  },

  confirmBtn: {
    height: 56,

    paddingHorizontal: 26,

    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  confirmText: {
    color: "#FFF",

    fontSize: 15,

    fontFamily:
      "PoppinsSemiBold",
  },
});