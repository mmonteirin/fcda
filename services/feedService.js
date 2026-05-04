import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export const criarPost = async ({ text, image }) => {
  const user = auth.currentUser;

  if (!user) throw new Error("Usuário não autenticado");

  await addDoc(collection(db, "posts"), {
    userId: user.uid,
    userName: user.displayName || "Usuário",
    userPhoto: user.photoURL || "",
    text,
    image,
    likes: 0,
    createdAt: serverTimestamp(),
  });
};
