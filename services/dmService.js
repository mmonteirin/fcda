/**
 * 💬 SERVIÇO: DIRECT MESSAGES
 * Enviar, receber e gerenciar mensagens diretas entre usuários
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
  limit,
  or,
  and,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// ✅ ENVIAR MENSAGEM
export const enviarMensagem = async ({
  remetenteId,
  remetenteName,
  remetentePhoto,
  destinatarioId,
  destinatarioName,
  destinatarioPhoto,
  texto,
  midia = null, // {tipo: 'imagem/video', uri}
}) => {
  try {
    // Criar conversaId (sempre em ordem alfabética para consistência)
    const conversaId = [remetenteId, destinatarioId].sort().join("_");

    const mensagemData = {
      conversaId,
      remetenteId,
      remetenteName,
      remetentePhoto,
      destinatarioId,
      destinatarioName,
      destinatarioPhoto,
      texto: texto.trim(),
      midia,
      lido: false,
      deletado: false,
      editado: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Adicionar mensagem
    const docRef = await addDoc(
      collection(db, "conversas", conversaId, "mensagens"),
      mensagemData
    );

    // Atualizar último update da conversa
    const conversaRef = doc(db, "conversas", conversaId);
    await updateDoc(conversaRef, {
      ultimaMensagem: texto,
      ultimaAtividade: serverTimestamp(),
      remetente: remetenteId,
    }).catch(async (e) => {
      // Se não existe, criar documento
      if (e.code === "not-found") {
        await addDoc(collection(db, "conversas"), {
          conversaId,
          participantes: [remetenteId, destinatarioId],
          ultimaMensagem: texto,
          ultimaAtividade: serverTimestamp(),
          remetente: remetenteId,
          naoLido: { [destinatarioId]: 1 },
        });
      }
    });

    return {
      success: true,
      mensagemId: docRef.id,
      mensagem: mensagemData,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ✅ OBTER CONVERSAS DO USUÁRIO
export const obterConversas = async (userId) => {
  try {
    // Buscar conversas onde o usuário participa
    const q = query(
      collection(db, "conversas"),
      where("participantes", "array-contains", userId),
      orderBy("ultimaAtividade", "desc")
    );

    const snapshot = await getDocs(q);
    const conversas = [];

    snapshot.forEach((doc) => {
      const conversa = { id: doc.id, ...doc.data() };
      conversas.push(conversa);
    });

    return conversas;
  } catch (error) {
    console.error("Erro ao obter conversas:", error);
    return [];
  }
};

// ✅ OBTER MENSAGENS DE UMA CONVERSA
export const obterMensagens = async (conversaId, limiteMsg = 50) => {
  try {
    const q = query(
      collection(db, "conversas", conversaId, "mensagens"),
      orderBy("createdAt", "desc"),
      limit(limiteMsg)
    );

    const snapshot = await getDocs(q);
    const mensagens = [];

    snapshot.forEach((doc) => {
      mensagens.push({ id: doc.id, ...doc.data() });
    });

    return mensagens.reverse(); // Reverter para ordem cronológica
  } catch (error) {
    console.error("Erro ao obter mensagens:", error);
    return [];
  }
};

// ✅ MARCAR MENSAGENS COMO LIDAS
export const marcarComolidas = async (conversaId, usuarioId) => {
  try {
    const q = query(
      collection(db, "conversas", conversaId, "mensagens"),
      where("destinatarioId", "==", usuarioId),
      where("lido", "==", false)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { lido: true });
    });

    // Atualizar contador na conversa
    const conversaRef = doc(db, "conversas", conversaId);
    await updateDoc(conversaRef, {
      naoLido: { [usuarioId]: 0 },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar como lidas:", error);
    return { success: false, error: error.message };
  }
};

// ✅ DELETAR MENSAGEM
export const deletarMensagem = async (conversaId, mensagemId, usuarioId) => {
  try {
    const mensagemRef = doc(
      db,
      "conversas",
      conversaId,
      "mensagens",
      mensagemId
    );
    const mensagemSnap = await (await import("firebase/firestore")).getDoc(
      mensagemRef
    );

    if (!mensagemSnap.exists()) {
      return { success: false, error: "Mensagem não encontrada" };
    }

    const mensagem = mensagemSnap.data();

    if (mensagem.remetenteId !== usuarioId) {
      return { success: false, error: "Permissão negada" };
    }

    await updateDoc(mensagemRef, {
      deletado: true,
      texto: "[Mensagem deletada]",
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    return { success: false, error: error.message };
  }
};

// ✅ EDITAR MENSAGEM
export const editarMensagem = async (
  conversaId,
  mensagemId,
  novoTexto,
  usuarioId
) => {
  try {
    const mensagemRef = doc(
      db,
      "conversas",
      conversaId,
      "mensagens",
      mensagemId
    );
    const mensagemSnap = await (await import("firebase/firestore")).getDoc(
      mensagemRef
    );

    if (!mensagemSnap.exists()) {
      return { success: false, error: "Mensagem não encontrada" };
    }

    const mensagem = mensagemSnap.data();

    if (mensagem.remetenteId !== usuarioId) {
      return { success: false, error: "Permissão negada" };
    }

    await updateDoc(mensagemRef, {
      texto: novoTexto.trim(),
      editado: true,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao editar mensagem:", error);
    return { success: false, error: error.message };
  }
};

// ✅ ESCUTAR MENSAGENS EM TEMPO REAL
export const escutarMensagens = (conversaId, callback) => {
  try {
    const q = query(
      collection(db, "conversas", conversaId, "mensagens"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const mensagens = [];

      snapshot.forEach((doc) => {
        mensagens.push({ id: doc.id, ...doc.data() });
      });

      callback(mensagens.reverse()); // Ordem cronológica
    });
  } catch (error) {
    console.error("Erro ao escutar mensagens:", error);
    return () => {};
  }
};

// ✅ ESCUTAR CONVERSAS EM TEMPO REAL
export const escutarConversas = (userId, callback) => {
  try {
    const q = query(
      collection(db, "conversas"),
      where("participantes", "array-contains", userId),
      orderBy("ultimaAtividade", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const conversas = [];

      snapshot.forEach((doc) => {
        conversas.push({ id: doc.id, ...doc.data() });
      });

      callback(conversas);
    });
  } catch (error) {
    console.error("Erro ao escutar conversas:", error);
    return () => {};
  }
};

// ✅ CONTAR MENSAGENS NÃO LIDAS
export const contarNaoLidas = async (userId) => {
  try {
    const conversas = await obterConversas(userId);
    let total = 0;

    for (const conversa of conversas) {
      const q = query(
        collection(db, "conversas", conversa.id, "mensagens"),
        where("destinatarioId", "==", userId),
        where("lido", "==", false)
      );

      const snapshot = await getDocs(q);
      total += snapshot.size;
    }

    return total;
  } catch (error) {
    console.error("Erro ao contar não lidas:", error);
    return 0;
  }
};

// ✅ BUSCAR OU CRIAR CONVERSA COM USUÁRIO
export const obterOuCriarConversa = async (
  usuarioId,
  outroUsuarioId,
  outroUsuarioName,
  outroUsuarioPhoto
) => {
  try {
    const conversaId = [usuarioId, outroUsuarioId].sort().join("_");
    const conversaRef = doc(db, "conversas", conversaId);

    const snap = await (
      await import("firebase/firestore")
    ).getDoc(conversaRef);

    if (snap.exists()) {
      return { success: true, conversaId, conversa: snap.data() };
    }

    // Criar nova conversa
    const novaConversa = {
      conversaId,
      participantes: [usuarioId, outroUsuarioId],
      ultimaMensagem: "",
      ultimaAtividade: serverTimestamp(),
      naoLido: { [outroUsuarioId]: 0 },
    };

    await (await import("firebase/firestore")).setDoc(
      conversaRef,
      novaConversa
    );

    return { success: true, conversaId, conversa: novaConversa };
  } catch (error) {
    console.error("Erro ao obter/criar conversa:", error);
    return { success: false, error: error.message };
  }
};
