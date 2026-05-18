/**
 * 🎫 SERVIÇO DE INGRESSOS COMPLETO
 * 
 * Gerencia compra, validação e histórico de ingressos
 * com suporte a múltiplos tipos e descontos
 */

import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
  Timestamp,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * TIPOS DE INGRESSO
 */
export const TIPOS_INGRESSO = {
  INTEIRA: { chave: "inteira", label: "Inteira", desconto: 0 },
  MEIA: { chave: "meia", label: "Meia Entrada (50%)", desconto: 0.5 },
  ESTUDANTE: { chave: "estudante", label: "Estudante (30%)", desconto: 0.3 },
  SENIOR: { chave: "senior", label: "Idoso/Deficiente (50%)", desconto: 0.5 },
  PROMOCIONAL: { chave: "promocional", label: "Promocional (50%)", desconto: 0.5 },
};

/**
 * STATUS DE INGRESSO
 */
export const STATUS_INGRESSO = {
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
  UTILIZADO: "utilizado",
};

/**
 * ✅ COMPRAR INGRESSO(S)
 * Valida, cria transação e gera ingressos
 */
export const comprarIngressos = async ({
  eventoId,
  userId,
  userName,
  userEmail,
  userPhoto,
  ingressos = [], // [{tipo: 'inteira', quantidade: 2}, ...]
  valorTotal,
  metodoPagamento = "credit_card",
  metadadosPagamento = {},
}) => {
  if (!eventoId || !userId) throw new Error("Dados inválidos");
  if (!ingressos.length) throw new Error("Nenhum ingresso selecionado");

  const eventoRef = doc(db, "eventos", eventoId);
  let compraId;

  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Verificar disponibilidade de ingressos
      const eventoSnap = await transaction.get(eventoRef);

      if (!eventoSnap.exists()) {
        throw new Error("Evento não encontrado");
      }

      const eventoData = eventoSnap.data();
      const capacidade = eventoData.capacidade || 0;
      const ingressosVendidos = eventoData.ingressosVendidos || 0;
      const totalSolicitado = ingressos.reduce((acc, ing) => acc + ing.quantidade, 0);

      if (capacidade > 0 && ingressosVendidos + totalSolicitado > capacidade) {
        throw new Error("Ingressos indisponíveis. Capacidade limite atingida.");
      }

      // 2. Criar documento de compra
      const compraRef = doc(
        collection(db, "usuarios", userId, "compras")
      );

      const compraData = {
        eventoId,
        eventoNome: eventoData.tituloEvento || "Evento",
        eventoData: eventoData.dataEvento,
        eventoHora: eventoData.horaInicio,
        eventoLocal: eventoData.localEvento,
        eventoFoto: eventoData.imagemEvento,
        userId,
        userName,
        userEmail,
        userPhoto,
        ingressos: ingressos.map(ing => ({
          ...ing,
          status: STATUS_INGRESSO.CONFIRMADO,
          codigoIngresso: gerarCodigoIngresso(),
          usadoEm: null,
        })),
        valorTotal,
        metodoPagamento,
        metadadosPagamento: {
          ...metadadosPagamento,
          timestamp: Timestamp.now(),
        },
        status: "confirmado",
        dataCompra: serverTimestamp(),
        dataValidade: Timestamp.fromDate(
          new Date(eventoData.dataEvento || new Date())
        ),
      };

      transaction.set(compraRef, compraData);
      compraId = compraRef.id;

      // 3. Atualizar contador de ingressos vendidos
      transaction.update(eventoRef, {
        ingressosVendidos: increment(totalSolicitado),
      });

      // 4. Criar documento de compra também na coleção raiz (para relatórios)
      const compraRaizRef = doc(collection(db, "comprasIngressos"));
      transaction.set(compraRaizRef, {
        ...compraData,
        usuarioId: userId,
      });

      return {
        success: true,
        compraId,
        ingressos: compraData.ingressos,
        mensagem: `${totalSolicitado} ingresso(s) comprado(s) com sucesso!`,
      };
    });
  } catch (error) {
    console.error("Erro ao comprar ingressos:", error);
    throw error;
  }
};

/**
 * 🎟️ GERAR CÓDIGO ÚNICO DE INGRESSO
 * Formato: EV-[eventoId]-[userId]-[timestamp]-[random]
 */
const gerarCodigoIngresso = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `INGR-${timestamp}-${random}`;
};

/**
 * 📋 OBTER INGRESSOS DO USUÁRIO
 * Retorna todos os ingressos comprados (futuros e passados)
 */
export const obterIngressosUsuario = async (userId, filtro = "todos") => {
  try {
    const comprasRef = collection(db, "usuarios", userId, "compras");
    const comprasQuery = query(
      comprasRef,
      orderBy("dataCompra", "desc")
    );

    const snapshot = await getDocs(comprasQuery);
    let compras = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtrar por status
    if (filtro === "proximos") {
      compras = compras.filter(c => {
        const dataEvento = c.dataValidade?.toDate?.() || new Date(c.eventoData);
        return dataEvento > new Date();
      });
    } else if (filtro === "passados") {
      compras = compras.filter(c => {
        const dataEvento = c.dataValidade?.toDate?.() || new Date(c.eventoData);
        return dataEvento <= new Date();
      });
    }

    return compras;
  } catch (error) {
    console.error("Erro ao obter ingressos:", error);
    return [];
  }
};

/**
 * 🔍 VERIFICAR INGRESSO NO EVENT
 * Valida o código do ingresso (para entrada no evento)
 */
export const verificarIngresso = async (codigoIngresso, eventoId) => {
  try {
    // Buscar em todas as compras
    const comprasRef = collection(db, "comprasIngressos");
    const q = query(
      comprasRef,
      where("eventoId", "==", eventoId)
    );

    const snapshot = await getDocs(q);
    let ingressoEncontrado = null;

    snapshot.forEach(doc => {
      const compra = doc.data();
      const ingresso = compra.ingressos?.find(
        i => i.codigoIngresso === codigoIngresso
      );

      if (ingresso) {
        ingressoEncontrado = {
          compraId: doc.id,
          ...compra,
          ingresso,
        };
      }
    });

    if (!ingressoEncontrado) {
      return {
        valido: false,
        mensagem: "Ingresso não encontrado",
      };
    }

    if (ingressoEncontrado.ingresso.status === STATUS_INGRESSO.UTILIZADO) {
      return {
        valido: false,
        mensagem: "Este ingresso já foi utilizado",
      };
    }

    if (ingressoEncontrado.ingresso.status === STATUS_INGRESSO.CANCELADO) {
      return {
        valido: false,
        mensagem: "Este ingresso foi cancelado",
      };
    }

    return {
      valido: true,
      mensagem: "Ingresso válido",
      ingresso: ingressoEncontrado,
    };
  } catch (error) {
    console.error("Erro ao verificar ingresso:", error);
    return {
      valido: false,
      mensagem: "Erro ao verificar ingresso",
    };
  }
};

/**
 * ✅ VALIDAR INGRESSO (Marcar como utilizado)
 * Chamado quando usuário entra no evento
 */
export const validarIngresso = async (codigoIngresso, eventoId) => {
  try {
    const verificacao = await verificarIngresso(codigoIngresso, eventoId);

    if (!verificacao.valido) {
      return verificacao;
    }

    const { compraId, ingresso } = verificacao.ingresso;

    // Atualizar documento de compra para marcar como utilizado
    const ingressosAtualizados = verificacao.ingresso.ingressos.map(ing =>
      ing.codigoIngresso === codigoIngresso
        ? { ...ing, status: STATUS_INGRESSO.UTILIZADO, usadoEm: new Date() }
        : ing
    );

    await updateDoc(doc(db, "comprasIngressos", compraId), {
      ingressos: ingressosAtualizados,
    });

    return {
      valido: true,
      mensagem: "Ingresso validado com sucesso",
      usuario: verificacao.ingresso.userName,
    };
  } catch (error) {
    console.error("Erro ao validar ingresso:", error);
    return {
      valido: false,
      mensagem: "Erro ao validar ingresso",
    };
  }
};

/**
 * 📊 OBTER ESTATÍSTICAS DE VENDAS
 * Para administradores/criadores de eventos
 */
export const obterEstatisticasVendas = async (eventoId) => {
  try {
    const comprasRef = collection(db, "comprasIngressos");
    const q = query(
      comprasRef,
      where("eventoId", "==", eventoId)
    );

    const snapshot = await getDocs(q);
    let totalVendido = 0;
    let arrecadacao = 0;
    const tiposVendidos = {};
    const statusIngressos = {
      [STATUS_INGRESSO.CONFIRMADO]: 0,
      [STATUS_INGRESSO.UTILIZADO]: 0,
      [STATUS_INGRESSO.CANCELADO]: 0,
    };

    snapshot.forEach(doc => {
      const compra = doc.data();

      compra.ingressos?.forEach(ing => {
        totalVendido++;
        arrecadacao += compra.valorTotal / compra.ingressos.length;
        tiposVendidos[ing.tipo] = (tiposVendidos[ing.tipo] || 0) + 1;
        statusIngressos[ing.status]++;
      });
    });

    return {
      totalIngressosVendidos: totalVendido,
      arrecadacaoTotal: parseFloat(arrecadacao.toFixed(2)),
      tiposVendidos,
      statusIngressos,
      comprasPorDia: agruparComprasPorDia(snapshot),
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return null;
  }
};

/**
 * 📅 Agrupar compras por dia
 */
const agruparComprasPorDia = (snapshot) => {
  const porDia = {};

  snapshot.forEach(doc => {
    const compra = doc.data();
    const data = compra.dataCompra?.toDate?.() || new Date();
    const chave = data.toISOString().split("T")[0];

    if (!porDia[chave]) {
      porDia[chave] = { compras: 0, ingressos: 0, receita: 0 };
    }

    porDia[chave].compras++;
    porDia[chave].ingressos += compra.ingressos?.length || 0;
    porDia[chave].receita += compra.valorTotal;
  });

  return porDia;
};

/**
 * ❌ CANCELAR COMPRA
 * Reembolsar ingressos (com política de reembolso)
 */
export const cancelarCompra = async (compraId, userId, motivo = "") => {
  try {
    const compraRef = doc(db, "usuarios", userId, "compras", compraId);
    const compraSnap = await getDoc(compraRef);

    if (!compraSnap.exists()) {
      throw new Error("Compra não encontrada");
    }

    const compra = compraSnap.data();

    // Verificar se pode cancelar (política: até 24h antes)
    const dataEvento = compra.dataValidade?.toDate?.() || new Date(compra.eventoData);
    const agora = new Date();
    const horas = (dataEvento - agora) / (1000 * 60 * 60);

    if (horas < 24) {
      throw new Error("Não é possível cancelar com menos de 24 horas do evento");
    }

    // Atualizar status
    await updateDoc(compraRef, {
      status: "cancelado",
      motivo,
      dataCancelamento: serverTimestamp(),
      ingressos: compra.ingressos.map(ing => ({
        ...ing,
        status: STATUS_INGRESSO.CANCELADO,
      })),
    });

    // Atualizar evento
    const eventoRef = doc(db, "eventos", compra.eventoId);
    await updateDoc(eventoRef, {
      ingressosVendidos: increment(-compra.ingressos.length),
    });

    return {
      success: true,
      mensagem: "Compra cancelada com sucesso",
      valorReembolso: compra.valorTotal,
    };
  } catch (error) {
    console.error("Erro ao cancelar compra:", error);
    throw error;
  }
};

export default {
  TIPOS_INGRESSO,
  STATUS_INGRESSO,
  comprarIngressos,
  obterIngressosUsuario,
  verificarIngresso,
  validarIngresso,
  obterEstatisticasVendas,
  cancelarCompra,
};
