import { createContext, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

const CadastroContext = createContext();

export function CadastroProvider({ children }) {

  const registerUser = async ({
    email,
    password,
    nome,
    role = "user",
    areaAtuacao = null,
    localAtuacao = null,
    cnpj = null,
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: nome,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nome,
        role,
        foto: "https://i.pravatar.cc/150",
        areaAtuacao,
        localAtuacao,
        cnpj,

        createdAt: serverTimestamp(),
      });

      return { success: true };

    } catch (error) {
      let message = "Erro ao cadastrar";

      if (error.code === "auth/email-already-in-use") {
        message = "Email já está em uso";
      } else if (error.code === "auth/invalid-email") {
        message = "Email inválido";
      } else if (error.code === "auth/weak-password") {
        message = "Senha muito fraca";
      }

      return { success: false, message };
    }
  };

  return (
    <CadastroContext.Provider value={{ registerUser }}>
      {children}
    </CadastroContext.Provider>
  );
}

export function useCadastro() {
  return useContext(CadastroContext);
}