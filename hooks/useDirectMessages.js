/**
 * 💬 HOOK: GERENCIAR DIRECT MESSAGES
 * Enviar, receber, editar mensagens em tempo real
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  enviarMensagem,
  obterConversas,
  obterMensagens,
  marcarComolidas,
  deletarMensagem,
  editarMensagem,
  escutarMensagens,
  escutarConversas,
  contarNaoLidas,
  obterOuCriarConversa,
} from "../services/dmService";

// ✅ Hook para gerenciar conversas
export const useDirectMessages = (userId) => {
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [naoLidas, setNaoLidas] = useState(0);
  const isMountedRef = useRef(true);

  // ✅ Listener de conversas
  useEffect(() => {
    if (!userId || !isMountedRef.current) return;

    try {
      setLoading(true);

      const unsubscribe = escutarConversas(userId, (novasConversas) => {
        if (isMountedRef.current) {
          setConversas(novasConversas);
          setLoading(false);

          // Contar não lidas
          let total = 0;
          novasConversas.forEach((c) => {
            total += c.naoLido?.[userId] || 0;
          });
          setNaoLidas(total);
        }
      });

      return () => {
        isMountedRef.current = false;
        unsubscribe();
      };
    } catch (err) {
      if (isMountedRef.current) {
        setErro(err.message);
        setLoading(false);
      }
    }
  }, [userId]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Iniciar conversa com usuário
  const iniciarConversa = useCallback(
    async (outroUserId, outroUserName, outroUserPhoto) => {
      try {
        const resultado = await obterOuCriarConversa(
          userId,
          outroUserId,
          outroUserName,
          outroUserPhoto
        );

        return resultado;
      } catch (err) {
        console.error("Erro ao iniciar conversa:", err);
        return { success: false, error: err.message };
      }
    },
    [userId]
  );

  return {
    conversas,
    loading,
    erro,
    naoLidas,
    iniciarConversa,
  };
};

// ✅ Hook para gerenciar conversa individual
export const useConversation = (userId, conversaId) => {
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const isMountedRef = useRef(true);

  // ✅ Listener de mensagens
  useEffect(() => {
    if (!conversaId || !userId || !isMountedRef.current) return;

    try {
      setLoading(true);

      // Carregar histórico
      obterMensagens(conversaId, 100).then((msgs) => {
        if (isMountedRef.current) {
          setMensagens(msgs);
          setLoading(false);
        }
      });

      // Listener em tempo real
      const unsubscribe = escutarMensagens(conversaId, (novasMensagens) => {
        if (isMountedRef.current) {
          setMensagens(novasMensagens);

          // Marcar como lidas
          marcarComolidas(conversaId, userId).catch((e) =>
            console.error(e)
          );
        }
      });

      return () => {
        isMountedRef.current = false;
        unsubscribe();
      };
    } catch (err) {
      if (isMountedRef.current) {
        setErro(err.message);
        setLoading(false);
      }
    }
  }, [conversaId, userId]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Enviar mensagem
  const enviar = useCallback(
    async (dados) => {
      if (!conversaId || !userId) return { success: false };

      try {
        setEnviando(true);

        const resultado = await enviarMensagem({
          remetenteId: userId,
          ...dados,
          conversaId,
        });

        if (isMountedRef.current) {
          setEnviando(false);
          if (resultado.success) {
            setErro(null);
          } else {
            setErro(resultado.error);
          }
        }

        return resultado;
      } catch (err) {
        if (isMountedRef.current) {
          setEnviando(false);
          setErro(err.message);
        }
        return { success: false, error: err.message };
      }
    },
    [conversaId, userId]
  );

  // ✅ Deletar mensagem
  const deletar = useCallback(
    async (mensagemId) => {
      try {
        const resultado = await deletarMensagem(
          conversaId,
          mensagemId,
          userId
        );

        if (resultado.success && isMountedRef.current) {
          // Atualizar localmente
          setMensagens((prev) =>
            prev.map((m) =>
              m.id === mensagemId
                ? { ...m, deletado: true, texto: "[Mensagem deletada]" }
                : m
            )
          );
        }

        return resultado;
      } catch (err) {
        console.error("Erro ao deletar:", err);
        return { success: false, error: err.message };
      }
    },
    [conversaId, userId]
  );

  // ✅ Editar mensagem
  const editar = useCallback(
    async (mensagemId, novoTexto) => {
      try {
        const resultado = await editarMensagem(
          conversaId,
          mensagemId,
          novoTexto,
          userId
        );

        if (resultado.success && isMountedRef.current) {
          // Atualizar localmente
          setMensagens((prev) =>
            prev.map((m) =>
              m.id === mensagemId
                ? { ...m, texto: novoTexto, editado: true }
                : m
            )
          );
        }

        return resultado;
      } catch (err) {
        console.error("Erro ao editar:", err);
        return { success: false, error: err.message };
      }
    },
    [conversaId, userId]
  );

  return {
    mensagens,
    loading,
    erro,
    enviando,
    enviar,
    deletar,
    editar,
    totalMensagens: mensagens.length,
  };
};

export default useDirectMessages;
