import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth, db } from "../firebaseConfig";

const AuthContext = createContext({});

export function AuthProvider({ children, navigationRef }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Inicializa persistência do Firebase na primeira renderização
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.warn("⚠️ Erro ao definir persistência:", error);
    });
  }, []);

  const buildUserData = (userAuth, dbData = {}) => {
    return {
      uid: userAuth.uid,
      email: userAuth.email,
      nome:
        dbData.nome ||
        userAuth.displayName ||
        userAuth.email?.split("@")[0] ||
        "Usuário",
      foto:
        dbData.foto ||
        userAuth.photoURL ||
        "https://i.pravatar.cc/150",
      role: (dbData.role || "user").toLowerCase(),
      areaAtuacao: dbData.areaAtuacao || null,
      localAtuacao: dbData.localAtuacao || null,
      cnpj: dbData.cnpj || null,
    };
  };

  // Carrega cache para UX rápida
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem("@auth_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
        }
      } catch (error) {
        console.log("Erro cache:", error);
      }
    };
    loadCache();
  }, []);

  // Listener global do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      console.log("🔥 [AuthContext] Firebase state changed - userAuth:", userAuth?.email);
      
      if (!userAuth) {
        console.log("🔓 [AuthContext] Usuário deslogado detectado");
        setUser(null);
        setProfile(null);
        await AsyncStorage.removeItem("@auth_user");
        setLoading(false);
        return;
      }

      console.log("🔐 [AuthContext] Usuário logado:", userAuth.email);
      setUser(userAuth);

      try {
        const docRef = doc(db, "users", userAuth.uid);
        const snap = await getDoc(docRef);
        const dbData = snap.exists() ? snap.data() : {};
        const userData = buildUserData(userAuth, dbData);

        setProfile(userData);
        await AsyncStorage.setItem("@auth_user", JSON.stringify(userData));
        console.log("✅ [AuthContext] Perfil carregado:", userData.nome);
      } catch (error) {
        console.log("⚠️ [AuthContext] Erro Firestore:", error);
        const fallback = buildUserData(userAuth);
        setProfile(fallback);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [loggingOut]);

  // ✅ Logout melhorado com ordem correta e tratamento de erros
  const logout = async () => {
    try {
      console.log("🚪 Logout chamado");
      console.log("🔄 Iniciando logout...");
      
      // Flag para ignorar listener durante logout
      setLoggingOut(true);

      // 4️⃣ Sign out do Firebase
      await signOut(auth);
      console.log("✅ Firebase sign out completo");
      
      // 1️⃣ Limpa cache
      await AsyncStorage.removeItem("@auth_user");
      console.log("✅ Cache removido");
      
      // 2️⃣ Atualiza estado local IMEDIATAMENTE
      setUser(null);
      setProfile(null);
      setLoading(false);
      console.log("✅ Estado local limpo");
      
      // 3️⃣ Reset da navegação
      if (navigationRef?.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        });
        console.log("🔄 Navegação resetada para Auth");
      }
      
      // 1.5️⃣ Limpa localStorage do navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.clear();
          console.log("✅ LocalStorage limpo");
        } catch (e) {
          console.warn("⚠️ Erro ao limpar localStorage:", e);
        }
      }
      
      // 5️⃣ Redefine persistência para session
      try {
        await setPersistence(auth, browserSessionPersistence);
        console.log("✅ Persistência resetada para session");
      } catch (e) {
        console.warn("⚠️ Erro ao resetar persistência:", e);
      }
      
      // Manter loggingOut true por 10 segundos para bloquear auto-login
      await new Promise(resolve => setTimeout(resolve, 10000));
      setLoggingOut(false);
      console.log("✅ Logout finalizado - permitindo novos logins");
      
      return true;
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      // Mesmo com erro, limpa o estado local
      setUser(null);
      setProfile(null);
      setLoading(false);
      console.log("✅ Estado local limpo (mesmo após erro)");
      
      // Reset navegação mesmo em erro
      if (navigationRef?.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        });
        console.log("🔄 Navegação resetada para Auth (após erro)");
      }
      
      // Esperar e liberar flag
      await new Promise(resolve => setTimeout(resolve, 10000));
      setLoggingOut(false);
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        nome: profile?.nome || "",
        foto: profile?.foto || null,
        role: profile?.role || "user",
        isAdmin: profile?.role === "admin",
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
