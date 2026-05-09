// firebaseConfig.js
// ✅ Removido Firebase Storage (não disponível no plano gratuito Spark)
// Use ImgBB via uploadService.js para upload de imagens

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";

/* 🔧 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCNld0ThxUsLpo84wcz9T8m3JeC3e8PlZE",
  authDomain: "monitoracult.firebaseapp.com",
  projectId: "monitoracult",
  storageBucket: "monitoracult.firebasestorage.app",
  messagingSenderId: "133936734015",
  appId: "1:133936734015:web:ff16ed3bc5c10552337d8a",
};

/* 🚀 APP */
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

/* 🔐 AUTH */
let auth;

if (Platform.OS === "web") {
  // 🌐 WEB
  auth = getAuth(app);
} else {
  // 📱 MOBILE
  try {
    const rnAuth = require("firebase/auth/react-native");
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;

    auth = initializeAuth(app, {
      persistence: rnAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // fallback: se já inicializado
    auth = getAuth(app);
  }
}

/* 🔥 FIRESTORE */
const db = getFirestore(app);

/* 📤 EXPORT — storage removido intencionalmente (plano Spark não suporta) */
export { app, db, auth };
