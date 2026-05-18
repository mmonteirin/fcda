import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "./Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* 🎨 GLOBAL STYLES */
const GlobalStyles = StyleSheet.create({
  /* 🔐 AUTH */
  authContainer: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
  },

  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 25,
    textAlign: "center",
  },

  authLabel: {
    color: Colors.primary,
    marginBottom: 6,
    fontSize: 13,
  },

  authInput: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  authButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  authButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  authError: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 13,
  },

  authLink: {
    color: Colors.primary,
    fontWeight: "bold",
  },

  /* 👤 PERFIL */
  profileContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  profileName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },

  profileEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },

  profileLink: {
    color: Colors.primary,
    marginTop: 8,
    fontSize: 13,
  },

  /* 🔍 SEARCH */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    fontWeight: "bold",
  },

  /* 🧩 CARDS */
  cardCategory: {
    backgroundColor: Colors.surface,
    width: "48%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  /* 📍 EVENTOS */
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },

  eventTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },

  eventInfoText: {
    color: Colors.textSecondary,
  },

  /* 🎯 BUTTON */
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  /* ❌ ERROR */
  error: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 13,
  },

  /* 📭 EMPTY */
  emptyState: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },

  /* ➖ DIVIDER */
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 15,
  },

  /* ⏳ LOADING */
  loadingSpinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  /* 🏠 TELA INICIO (mantida compatível) */
  telaInicioContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  telaInicioCardDestaque: {
    width: SCREEN_WIDTH * 0.68,
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  telaInicioCardCompacto: {
    width: 130,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },
});

/* 🔥 IMPORTANTE: manter compatibilidade */
GlobalStyles.colors = Colors;

export default GlobalStyles;
