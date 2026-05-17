import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

/**
 * Criar um novo post/evento no feed
 */
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

/**
 * Fazer like/unlike em um evento do feed
 */
export const toggleEventoLike = async (eventoId, userId) => {
  if (!userId) throw new Error("Usuário não autenticado");

  try {
    const eventoRef = doc(db, "eventos", eventoId);

    // Buscar evento atual
    const { getDoc } = await import("firebase/firestore");
    const eventoSnap = await getDoc(eventoRef);

    if (!eventoSnap.exists()) {
      throw new Error("Evento não encontrado");
    }

    const eventData = eventoSnap.data();
    const currentLikes = eventData.likes || 0;

    // Buscar likes do usuário
    const likesQuery = query(
      collection(db, "likes"),
      where("eventoId", "==", eventoId),
      where("userId", "==", userId)
    );

    const likesSnapshot = await getDocs(likesQuery);
    const isLiked = !likesSnapshot.empty;

    if (isLiked) {
      // Remover like
      await updateDoc(eventoRef, {
        likes: Math.max(0, currentLikes - 1),
      });
    } else {
      // Adicionar like
      await updateDoc(eventoRef, {
        likes: currentLikes + 1,
      });

      // Registrar no documento de likes
      await addDoc(collection(db, "likes"), {
        eventoId,
        userId,
        createdAt: serverTimestamp(),
      });
    }

    return !isLiked;
  } catch (error) {
    console.log("Erro ao fazer like:", error);
    throw error;
  }
};

/**
 * Obter IDs dos eventos que o usuário curtiu
 */
export const getUserFeedLikes = async (userId) => {
  if (!userId) return [];

  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("userId", "==", userId)
    );

    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.docs.map((d) => d.data().eventoId);
  } catch (error) {
    console.log("Erro ao buscar likes:", error);
    return [];
  }
};

/**
 * Adicionar comentário em um evento
 */
export const adicionarComentario = async (eventoId, texto) => {
  const user = auth.currentUser;

  if (!user) throw new Error("Usuário não autenticado");
  if (!texto.trim()) throw new Error("Comentário não pode estar vazio");

  try {
    const comentarioRef = await addDoc(
      collection(db, "eventos", eventoId, "comentarios"),
      {
        userId: user.uid,
        userName: user.displayName || "Usuário",
        userPhoto: user.photoURL || "",
        texto: texto.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
      }
    );

    // Incrementar contador de comentários no evento
    const eventoRef = doc(db, "eventos", eventoId);
    const { getDoc } = await import("firebase/firestore");
    const eventoSnap = await getDoc(eventoRef);

    if (eventoSnap.exists()) {
      const currentComentarios = eventoSnap.data().comentarios || 0;
      await updateDoc(eventoRef, {
        comentarios: currentComentarios + 1,
      });
    }

    return comentarioRef.id;
  } catch (error) {
    console.log("Erro ao adicionar comentário:", error);
    throw error;
  }
};
