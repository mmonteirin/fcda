/**
 * useMapaVivo.js
 * Hook completo para o sistema Mapa Vivo da Cultura
 * Gerencia: localização, eventos, heatmap, filtros ao vivo, check-ins
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import {
  getMapEventsFirestore,
  getMapEventsMock,
  getHotspotsFirestore,
  getHotspotsMock,
  realizarCheckIn,
  getCheckInsByEvent,
  getMeusCheckIns,
  getMapaSummary,
  calcularDistancia,
} from "../services/mapaVivoService";

const LOCATION_CONFIG = {
  accuracy: Location.Accuracy.High,
  timeInterval: 15000,   // atualiza a cada 15s
  distanceInterval: 30,  // ou a cada 30m
};

export const useMapaVivo = () => {
  // ─── LOCALIZAÇÃO ────────────────────────────────────────────────────────────
  const [localizacao, setLocalizacao] = useState(null);
  const [permissaoNegada, setPermissaoNegada] = useState(false);

  // ─── EVENTOS ────────────────────────────────────────────────────────────────
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [loadingEventos, setLoadingEventos] = useState(false);

  // ─── HEATMAP ────────────────────────────────────────────────────────────────
  const [hotspots, setHotspots] = useState([]);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  // ─── FILTROS ────────────────────────────────────────────────────────────────
  const [generoFiltro, setGeneroFiltro] = useState(null);
  const [raioKm, setRaioKm] = useState(10);
  const [apenasProximos, setApenasProximos] = useState(false);

  // ─── CHECK-IN ────────────────────────────────────────────────────────────────
  const [checkInsEvento, setCheckInsEvento] = useState([]);
  const [meusCheckIns, setMeusCheckIns] = useState([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [successCheckIn, setSuccessCheckIn] = useState(false);

  // ─── RESUMO (painel) ─────────────────────────────────────────────────────────
  const [resumoPainel, setResumoPainel] = useState(null);

  // ─── ERRO / REFS ─────────────────────────────────────────────────────────────
  const [erro, setErro] = useState(null);
  const isMounted = useRef(true);
  const locationSub = useRef(null);
  const refreshTimer = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      locationSub.current?.remove();
      clearInterval(refreshTimer.current);
    };
  }, []);

  // ─── INICIAR RASTREAMENTO ────────────────────────────────────────────────────
  const iniciarLocalizacao = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (isMounted.current) setPermissaoNegada(true);
        // Usar Fortaleza como padrão quando sem permissão
        if (isMounted.current) {
          setLocalizacao({ latitude: -3.7327, longitude: -38.5270 });
        }
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (isMounted.current) {
        setLocalizacao({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }

      const sub = await Location.watchPositionAsync(LOCATION_CONFIG, (pos) => {
        if (isMounted.current) {
          setLocalizacao({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      });
      locationSub.current = sub;
    } catch (err) {
      // Fallback Fortaleza
      if (isMounted.current) {
        setLocalizacao({ latitude: -3.7327, longitude: -38.5270 });
      }
    }
  }, []);

  // ─── CARREGAR EVENTOS ────────────────────────────────────────────────────────
  const carregarEventos = useCallback(
    async (lat, lng) => {
      if (!lat || !lng) return;
      if (!isMounted.current) return;
      setLoadingEventos(true);
      setErro(null);
      try {
        const lista = await getMapEventsFirestore(lat, lng, generoFiltro);
        if (isMounted.current) {
          const filtrados = apenasProximos
            ? lista.filter((e) => e.distance <= raioKm)
            : lista;
          setEventos(filtrados);
        }
      } catch {
        const fallback = getMapEventsMock(lat, lng, generoFiltro);
        if (isMounted.current) setEventos(fallback);
      } finally {
        if (isMounted.current) setLoadingEventos(false);
      }
    },
    [generoFiltro, apenasProximos, raioKm]
  );

  // ─── CARREGAR HEATMAP ────────────────────────────────────────────────────────
  const carregarHeatmap = useCallback(
    async (lat, lng) => {
      if (!lat || !lng) return;
      setLoadingHeatmap(true);
      try {
        const data = await getHotspotsFirestore(lat, lng);
        if (isMounted.current) setHotspots(data);
      } catch {
        if (isMounted.current) setHotspots(getHotspotsMock());
      } finally {
        if (isMounted.current) setLoadingHeatmap(false);
      }
    },
    []
  );

  // ─── EFEITO: localização → carregar dados ────────────────────────────────────
  useEffect(() => {
    if (localizacao) {
      carregarEventos(localizacao.latitude, localizacao.longitude);
      carregarHeatmap(localizacao.latitude, localizacao.longitude);
      getMapaSummary(localizacao.latitude, localizacao.longitude)
        .then((r) => { if (isMounted.current) setResumoPainel(r); })
        .catch(() => {});
    }
  }, [localizacao, generoFiltro, carregarEventos, carregarHeatmap]);

  // ─── EFEITO: auto-refresh a cada 30s ────────────────────────────────────────
  useEffect(() => {
    if (!localizacao) return;
    refreshTimer.current = setInterval(() => {
      carregarEventos(localizacao.latitude, localizacao.longitude);
    }, 30000);
    return () => clearInterval(refreshTimer.current);
  }, [localizacao, carregarEventos]);

  // ─── SELECIONAR EVENTO ───────────────────────────────────────────────────────
  const selecionarEvento = useCallback((evento) => {
    setEventoSelecionado(evento);
    if (evento) {
      carregarCheckInsEvento(evento.id);
    }
  }, []);

  // ─── CHECK-IN ────────────────────────────────────────────────────────────────
  const fazerCheckIn = useCallback(
    async (eventId, dados = {}) => {
      if (!localizacao) throw new Error("Localização não disponível");
      setLoadingCheckIn(true);
      setSuccessCheckIn(false);
      try {
        await realizarCheckIn(eventId, {
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          ...dados,
        });
        if (isMounted.current) {
          setSuccessCheckIn(true);
          await carregarEventos(localizacao.latitude, localizacao.longitude);
          await carregarCheckInsEvento(eventId);
          await carregarMeusCheckIns();
        }
        return true;
      } finally {
        if (isMounted.current) setLoadingCheckIn(false);
      }
    },
    [localizacao, carregarEventos]
  );

  const carregarCheckInsEvento = useCallback(async (eventId) => {
    try {
      const lista = await getCheckInsByEvent(eventId);
      if (isMounted.current) setCheckInsEvento(lista);
    } catch {
      if (isMounted.current) setCheckInsEvento([]);
    }
  }, []);

  const carregarMeusCheckIns = useCallback(async () => {
    try {
      const lista = await getMeusCheckIns();
      if (isMounted.current) setMeusCheckIns(lista);
    } catch {
      if (isMounted.current) setMeusCheckIns([]);
    }
  }, []);

  // ─── TOGGLES ─────────────────────────────────────────────────────────────────
  const toggleHeatmap = useCallback(() => setMostrarHeatmap((v) => !v), []);

  const alterarFiltroGenero = useCallback((genero) => {
    setGeneroFiltro(genero);
    setEventoSelecionado(null);
  }, []);

  // ─── REFRESH MANUAL ──────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    if (localizacao) {
      carregarEventos(localizacao.latitude, localizacao.longitude);
      carregarHeatmap(localizacao.latitude, localizacao.longitude);
    }
  }, [localizacao, carregarEventos, carregarHeatmap]);

  // ─── EVENTOS PRÓXIMOS (ordenados por distância ≤ 2km) ──────────────────────
  const eventosProximos = eventos
    .filter((e) => e.distance !== undefined && e.distance <= 2)
    .slice(0, 5);

  return {
    // Localização
    localizacao,
    permissaoNegada,
    iniciarLocalizacao,

    // Eventos
    eventos,
    eventosProximos,
    eventoSelecionado,
    loadingEventos,
    selecionarEvento,

    // Heatmap
    hotspots,
    mostrarHeatmap,
    toggleHeatmap,
    loadingHeatmap,

    // Filtros
    generoFiltro,
    alterarFiltroGenero,
    raioKm,
    setRaioKm,
    apenasProximos,
    setApenasProximos,

    // Check-in
    checkInsEvento,
    meusCheckIns,
    loadingCheckIn,
    successCheckIn,
    fazerCheckIn,
    carregarCheckInsEvento,
    carregarMeusCheckIns,

    // Painel
    resumoPainel,

    // Utils
    erro,
    refresh,
  };
};
