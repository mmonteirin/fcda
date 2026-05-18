/**
 * TelaMapaVivo.js
 * Compatível com:
 * ✅ Android
 * ✅ iOS
 * ✅ Web (sem crash)
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
} from "react-native";

/**
 * IMPORT CONDICIONAL
 * evita crash no web
 */
let MapView = null;
let Marker = null;
let Circle = null;
let PROVIDER_GOOGLE = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");

  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
  PROVIDER_GOOGLE =
    Maps.PROVIDER_GOOGLE;
}

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { BlurView } from "expo-blur";

import { MotiView } from "moti";

import { Colors } from "../styles/Colors";

import { useMapaVivo } from "../hooks/useMapaVivo";

import MapFilter from "../components/MapFilter";

import HeatmapLegend from "../components/HeatmapLegend";

import MapEventMarker from "../components/MapEventMarker";

import EventosProximosPainel from "../components/EventosProximosPainel";

/* ───────────────────────────────────────────── */

const PAINEL_FECHADO = 80;

const PAINEL_ABERTO = 340;

const REGION_DELTA = {
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const heatColor = (
  intensity
) => {
  if (intensity >= 80)
    return {
      fill: "rgba(239,68,68,0.22)",
      stroke:
        "rgba(239,68,68,0.55)",
    };

  if (intensity >= 50)
    return {
      fill: "rgba(245,158,11,0.20)",
      stroke:
        "rgba(245,158,11,0.50)",
    };

  if (intensity >= 30)
    return {
      fill: "rgba(34,197,94,0.18)",
      stroke:
        "rgba(34,197,94,0.45)",
    };

  return {
    fill: "rgba(99,202,253,0.14)",
    stroke:
      "rgba(99,202,253,0.35)",
  };
};

/* ───────────────────────────────────────────── */

export default function TelaMapaVivo({
  navigation,
}) {
  /**
   * FALLBACK WEB
   * react-native-maps não funciona no Expo Web
   */

  if (Platform.OS === "web") {
    return (
      <View
        style={
          styles.webContainer
        }
      >
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={[
            "#0F172A",
            "#111827",
          ]}
          style={
            styles.webGradient
          }
        >
          <MaterialCommunityIcons
            name="map-off"
            size={90}
            color="#64748B"
          />

          <Text
            style={
              styles.webTitle
            }
          >
            Mapa indisponível
          </Text>

          <Text
            style={
              styles.webText
            }
          >
            O Mapa Vivo está
            disponível apenas no
            Android e iOS.
          </Text>

          <TouchableOpacity
            style={
              styles.webButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.webButtonText
              }
            >
              Voltar
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const {
    localizacao,
    permissaoNegada,
    iniciarLocalizacao,
    eventos,
    eventosProximos,
    eventoSelecionado,
    loadingEventos,
    selecionarEvento,
    hotspots,
    mostrarHeatmap,
    toggleHeatmap,
    generoFiltro,
    alterarFiltroGenero,
    refresh,
  } = useMapaVivo();

  const mapRef = useRef(null);

  const painelAnim =
    useRef(
      new Animated.Value(
        PAINEL_FECHADO
      )
    ).current;

  const [painelAberto, setPainelAberto] =
    useState(false);

  const [liveIndicator] =
    useState(
      new Animated.Value(1)
    );

  /* ───────────────────────────────────────── */

  useEffect(() => {
    iniciarLocalizacao();
  }, []);

  /* ───────────────────────────────────────── */

  useEffect(() => {
    const anim =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            liveIndicator,
            {
              toValue: 0.2,
              duration: 800,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            liveIndicator,
            {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }
          ),
        ])
      );

    anim.start();

    return () => anim.stop();
  }, []);

  /* ───────────────────────────────────────── */

  const togglePainel =
    useCallback(() => {
      const toValue =
        painelAberto
          ? PAINEL_FECHADO
          : PAINEL_ABERTO;

      Animated.spring(
        painelAnim,
        {
          toValue,
          useNativeDriver: false,
          tension: 55,
          friction: 9,
        }
      ).start();

      setPainelAberto(
        (v) => !v
      );
    }, [
      painelAberto,
      painelAnim,
    ]);

  /* ───────────────────────────────────────── */

  const focarEvento =
    useCallback(
      (evento) => {
        selecionarEvento(
          evento
        );

        mapRef.current?.animateToRegion(
          {
            latitude:
              evento.location
                .latitude,

            longitude:
              evento.location
                .longitude,

            ...REGION_DELTA,
          },
          600
        );

        if (painelAberto)
          togglePainel();
      },
      [
        selecionarEvento,
        painelAberto,
        togglePainel,
      ]
    );

  /* ───────────────────────────────────────── */

  const focarLocalizacao =
    useCallback(() => {
      if (localizacao) {
        mapRef.current?.animateToRegion(
          {
            ...localizacao,
            ...REGION_DELTA,
          },
          600
        );
      }
    }, [localizacao]);

  /* ───────────────────────────────────────── */

  if (!localizacao) {
    return (
      <View
        style={
          styles.fullCenter
        }
      >
        <StatusBar barStyle="light-content" />

        <ActivityIndicator
          size="large"
          color={
            Colors.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          {permissaoNegada
            ? "Usando localização padrão..."
            : "Localizando você..."}
        </Text>
      </View>
    );
  }

  /* ───────────────────────────────────────── */

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* MAPA */}

      <MapView
        ref={mapRef}
        style={
          StyleSheet.absoluteFill
        }
        provider={
          Platform.OS ===
          "android"
            ? PROVIDER_GOOGLE
            : undefined
        }
        initialRegion={{
          ...localizacao,
          ...REGION_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={
          false
        }
        customMapStyle={
          darkMapStyle
        }
      >
        {/* HEATMAP */}

        {mostrarHeatmap &&
          hotspots.map(
            (h, i) => {
              const {
                fill,
                stroke,
              } = heatColor(
                h.intensity
              );

              return (
                <Circle
                  key={`hs_${i}`}
                  center={{
                    latitude:
                      h.latitude,

                    longitude:
                      h.longitude,
                  }}
                  radius={
                    400 +
                    h.intensity *
                      12
                  }
                  fillColor={
                    fill
                  }
                  strokeColor={
                    stroke
                  }
                  strokeWidth={
                    1.5
                  }
                />
              );
            }
          )}

        {/* MARCADORES */}

        {eventos.map(
          (evento) => (
            <Marker
              key={evento.id}
              coordinate={{
                latitude:
                  evento
                    .location
                    .latitude,

                longitude:
                  evento
                    .location
                    .longitude,
              }}
              onPress={() =>
                focarEvento(
                  evento
                )
              }
              tracksViewChanges={
                false
              }
            >
              <MapEventMarker
                {...evento}
                isSelected={
                  eventoSelecionado?.id ===
                  evento.id
                }
                onPress={() =>
                  focarEvento(
                    evento
                  )
                }
              />
            </Marker>
          )
        )}
      </MapView>

      {/* FILTRO */}

      <View
        style={
          styles.filterBar
        }
      >
        <View
          style={
            styles.liveRow
          }
        >
          <Animated.View
            style={[
              styles.liveDot,
              {
                opacity:
                  liveIndicator,
              },
            ]}
          />

          <Text
            style={
              styles.liveLabel
            }
          >
            AO VIVO
          </Text>

          {loadingEventos && (
            <ActivityIndicator
              size="small"
              color={
                Colors.primary
              }
              style={{
                marginLeft: 8,
              }}
            />
          )}
        </View>

        <MapFilter
          selectedGenre={
            generoFiltro
          }
          onGenreChange={
            alterarFiltroGenero
          }
          showHeatmap={
            mostrarHeatmap
          }
          onHeatmapToggle={
            toggleHeatmap
          }
        />
      </View>

      {/* LEGENDA */}

      {mostrarHeatmap && (
        <MotiView
          from={{
            opacity: 0,
            translateX: 20,
          }}
          animate={{
            opacity: 1,
            translateX: 0,
          }}
          style={
            styles.legendaContainer
          }
        >
          <HeatmapLegend />
        </MotiView>
      )}

      {/* FABS */}

      <View
        style={
          styles.fabContainer
        }
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={
            focarLocalizacao
          }
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color={
              Colors.textPrimary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={refresh}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={
              Colors.textPrimary
            }
          />
        </TouchableOpacity>
      </View>

      {/* PAINEL */}

      <Animated.View
        style={[
          styles.painel,
          {
            height:
              painelAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={
            togglePainel
          }
          style={
            styles.painelHandle
          }
        >
          <View
            style={
              styles.handleBar
            }
          />

          <View
            style={
              styles.painelHeader
            }
          >
            <View
              style={
                styles.painelHeaderLeft
              }
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={20}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.painelTitle
                }
              >
                Eventos Próximos
              </Text>
            </View>

            <View
              style={
                styles.eventBadge
              }
            >
              <Text
                style={
                  styles.eventBadgeText
                }
              >
                {
                  eventosProximos.length
                }
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {painelAberto && (
          <EventosProximosPainel
            eventos={
              eventos
            }
            eventoSelecionado={
              eventoSelecionado
            }
            onPress={
              focarEvento
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

/* ───────────────────────────────────────── */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    fullCenter: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop: 14,
      color:
        Colors.textSecondary,
    },

    webContainer: {
      flex: 1,
      backgroundColor:
        "#0F172A",
    },

    webGradient: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      padding: 30,
    },

    webTitle: {
      color: "#FFF",
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 20,
    },

    webText: {
      color: "#94A3B8",
      textAlign: "center",
      marginTop: 12,
      lineHeight: 24,
      fontSize: 16,
    },

    webButton: {
      marginTop: 30,
      backgroundColor:
        Colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 16,
    },

    webButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },

    filterBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor:
        "rgba(15,15,20,0.94)",
      borderBottomWidth: 1,
      borderBottomColor:
        Colors.border,
      paddingTop:
        Platform.OS ===
        "ios"
          ? 48
          : StatusBar.currentHeight +
            8,
    },

    liveRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 6,
      gap: 6,
    },

    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#EF4444",
    },

    liveLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: "#EF4444",
      letterSpacing: 1,
    },

    legendaContainer: {
      position: "absolute",
      top:
        Platform.OS ===
        "ios"
          ? 160
          : 140,
      right: 12,
      width: 180,
    },

    fabContainer: {
      position: "absolute",
      right: 14,
      bottom: 120,
      gap: 10,
    },

    fab: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        Colors.surface,
      justifyContent:
        "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        Colors.border,
    },

    painel: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor:
        Colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderTopColor:
        Colors.border,
      overflow: "hidden",
    },

    painelHandle: {
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },

    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        Colors.border,
      alignSelf: "center",
      marginBottom: 10,
    },

    painelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    painelHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
    },

    painelTitle: {
      fontSize: 14,
      fontWeight: "700",
      color:
        Colors.textPrimary,
    },

    eventBadge: {
      backgroundColor:
        Colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },

    eventBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#fff",
    },
  });

/* ───────────────────────────────────────── */

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      { color: "#1a1a2e" },
    ],
  },

  {
    elementType:
      "labels.text.fill",
    stylers: [
      { color: "#757575" },
    ],
  },

  {
    elementType:
      "labels.text.stroke",
    stylers: [
      { color: "#121212" },
    ],
  },
];