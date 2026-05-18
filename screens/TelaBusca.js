import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Text,
  Dimensions,
  Modal,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import SkeletonContent from "react-native-skeleton-content";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getEventosApp } from "../services/eventosAppService";
import { getEventos } from "../services/mapaCulturalService";
import { Colors } from "../styles/Colors";

const { width: SCREEN_WIDTH } =
  Dimensions.get("window");

const CARD_W = SCREEN_WIDTH * 0.72;

const DEFAULT_IMAGE =
  "https://placehold.co/600x400?text=Evento";

function normalizarApp(item) {
  return {
    id: `app_${item.id}`,
    titulo:
      item.tituloEvento ||
      item.name ||
      "Evento",

    imagem:
      item.imagemEvento ||
      item.files?.header?.url ||
      DEFAULT_IMAGE,

    local:
      item.localEvento ||
      item.nomeLocal ||
      item.location?.name ||
      "Local não informado",

    categoria:
      (
        item.categoria ||
        item.tipoEvento ||
        "outros"
      ).toLowerCase(),

    descricao:
      item.descricao ||
      item.shortDescription ||
      "Evento cadastrado no MonitoraCult",

    score: item.score || 0,
    likes: item.likes || 0,
    views: item.views || 0,
    origem: "app",
    original: item,
  };
}

function normalizarMapa(
  item,
  index
) {
  return {
    id: `mapa_${item.id || index}`,

    titulo: item.name || "Evento",

    imagem:
      item?.files?.header?.url ||
      item?.files?.avatar?.url ||
      DEFAULT_IMAGE,

    local:
      item?.location?.name ||
      "Local não informado",

    categoria: (
      item?.type || "outros"
    ).toLowerCase(),

    descricao:
      item?.shortDescription ||
      "Evento do Mapa Cultural do Ceará",

    score: 0,
    likes: 0,
    views: 0,
    origem: "mapa",
    original: item,
  };
}

const CATEGORIAS = [
  {
    nome: "teatro",
    icon: "drama-masks",
  },

  {
    nome: "shows",
    icon: "music",
  },

  {
    nome: "cinema",
    icon: "movie",
  },

  {
    nome: "exposição",
    icon: "image-frame",
  },

  {
    nome: "dança",
    icon: "human",
  },

  {
    nome: "gastronomia",
    icon:
      "silverware-fork-knife",
  },

  {
    nome: "infantil",
    icon: "baby-face-outline",
  },

  {
    nome: "outros",
    icon: "dots-horizontal",
  },
];

const ABAS = [
  {
    key: "todos",
    label: "Todos",
  },

  {
    key: "app",
    label: "MonitoraCult",
  },

  {
    key: "mapa",
    label: "Mapa Cultural",
  },
];

export default function TelaBusca({
  navigation,
}) {
  const insets =
    useSafeAreaInsets();

  const scrollX = useSharedValue(0);

  const [query, setQuery] =
    useState("");

  const [eventosApp, setEventosApp] =
    useState([]);

  const [
    eventosMapa,
    setEventosMapa,
  ] = useState([]);

  const [loadingApp, setLoadingApp] =
    useState(true);

  const [
    loadingMapa,
    setLoadingMapa,
  ] = useState(true);

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState(null);

  const [abaAtiva, setAbaAtiva] =
    useState("todos");

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data =
          await getEventosApp();

        setEventosApp(
          data.map(normalizarApp)
        );
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingApp(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response =
          await getEventos();

        const lista =
          Array.isArray(response)
            ? response
            : response?.data ||
              response?.results ||
              [];

        setEventosMapa(
          lista.map(normalizarMapa)
        );
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingMapa(false);
      }
    })();
  }, []);

  const todosMerged =
    useMemo(() => {
      const titulosApp =
        new Set(
          eventosApp.map((e) =>
            e.titulo.toLowerCase()
          )
        );

      const mapaFiltrado =
        eventosMapa.filter(
          (e) =>
            !titulosApp.has(
              e.titulo.toLowerCase()
            )
        );

      const appOrdenado = [
        ...eventosApp,
      ].sort(
        (a, b) =>
          b.score - a.score
      );

      return [
        ...appOrdenado,
        ...mapaFiltrado,
      ];
    }, [
      eventosApp,
      eventosMapa,
    ]);

  const eventosFiltrados =
    useMemo(() => {
      let base = todosMerged;

      if (abaAtiva !== "todos") {
        base = base.filter(
          (e) =>
            e.origem === abaAtiva
        );
      }

      if (
        categoriaSelecionada
      ) {
        base = base.filter((e) =>
          e.categoria.includes(
            categoriaSelecionada
          )
        );
      }

      if (query.trim()) {
        const q =
          query.toLowerCase();

        base = base.filter(
          (e) =>
            e.titulo
              .toLowerCase()
              .includes(q) ||
            e.local
              .toLowerCase()
              .includes(q) ||
            e.categoria
              .toLowerCase()
              .includes(q)
        );
      }

      return base;
    }, [
      todosMerged,
      abaAtiva,
      categoriaSelecionada,
      query,
    ]);

  const toggleCategoria =
    useCallback((nome) => {
      setCategoriaSelecionada(
        (prev) =>
          prev === nome
            ? null
            : nome
      );
    }, []);

  const loading =
    loadingApp || loadingMapa;

  const abrirEvento = (
    item
  ) => {
    if (item.origem === "mapa") {
      setModalVisible(true);

      return;
    }

    navigation.navigate(
      "Detalhes",
      {
        evento: item.original,
      }
    );
  };

  const CardEvento = ({
    item,
    index,
  }) => {
    const scale =
      useSharedValue(1);

    const animatedStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            scale: scale.value,
          },
        ],
      }));

    const imageStyle =
      useAnimatedStyle(() => {
        const imageScale =
          interpolate(
            scrollX.value,
            [
              (index - 1) *
                (CARD_W + 16),

              index *
                (CARD_W + 16),

              (index + 1) *
                (CARD_W + 16),
            ],
            [1, 1.08, 1]
          );

        return {
          transform: [
            {
              scale: imageScale,
            },
          ],
        };
      });

    return (
      <Animated.View
        entering={FadeInRight.delay(
          index * 100
        ).springify()}
        layout={Layout.springify()}
        style={animatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.96}
          style={styles.card}
          onPress={() =>
            abrirEvento(item)
          }
          onPressIn={() => {
            scale.value =
              withSpring(0.97);
          }}
          onPressOut={() => {
            scale.value =
              withSpring(1);
          }}
        >
          <Animated.Image
            source={{
              uri: item.imagem,
            }}
            style={[
              styles.img,
              imageStyle,
            ]}
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.30)",
              "rgba(0,0,0,0.96)",
            ]}
            style={styles.overlay}
          />

          <BlurView
            intensity={30}
            tint="dark"
            style={[
              styles.badge,
              item.origem === "app"
                ? styles.badgeApp
                : styles.badgeMapa,
            ]}
          >
            <MaterialCommunityIcons
              name={
                item.origem ===
                "app"
                  ? "star"
                  : "earth"
              }
              size={11}
              color="#fff"
            />

            <Text
              style={
                styles.badgeText
              }
            >
              {item.origem ===
              "app"
                ? "MonitoraCult"
                : "Evento Público"}
            </Text>
          </BlurView>

          <View
            style={styles.cardInfo}
          >
            {item.origem ===
              "app" && (
              <View
                style={
                  styles.metricsRow
                }
              >
                <View
                  style={
                    styles.metric
                  }
                >
                  <MaterialCommunityIcons
                    name="heart"
                    size={12}
                    color={
                      Colors.error
                    }
                  />

                  <Text
                    style={
                      styles.metricText
                    }
                  >
                    {item.likes}
                  </Text>
                </View>

                <View
                  style={
                    styles.metric
                  }
                >
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={12}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.metricText
                    }
                  >
                    {item.views}
                  </Text>
                </View>
              </View>
            )}

            <Text
              numberOfLines={2}
              style={styles.titulo}
            >
              {item.titulo}
            </Text>

            <Text
              numberOfLines={2}
              style={
                styles.descricao
              }
            >
              {item.descricao}
            </Text>

            <View
              style={
                styles.locationRow
              }
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="rgba(255,255,255,0.8)"
              />

              <Text
                numberOfLines={1}
                style={styles.local}
              >
                {item.local}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const LinhaEvento = ({
    item,
    index,
  }) => {
    const scale =
      useSharedValue(1);

    const animatedStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            scale: scale.value,
          },
        ],
      }));

    return (
      <Animated.View
        entering={FadeInDown.delay(
          index * 70
        ).springify()}
        layout={Layout.springify()}
        style={animatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.linha}
          onPress={() =>
            abrirEvento(item)
          }
          onPressIn={() => {
            scale.value =
              withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value =
              withSpring(1);
          }}
        >
          <Animated.Image
            source={{
              uri: item.imagem,
            }}
            style={
              styles.linhaImg
            }
          />

          <View
            style={
              styles.linhaInfo
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.linhaTitulo
              }
            >
              {item.titulo}
            </Text>

            <Text
              numberOfLines={1}
              style={
                styles.linhaLocal
              }
            >
              📍 {item.local}
            </Text>

            <Text
              numberOfLines={1}
              style={
                styles.linhaCategoria
              }
            >
              {item.categoria}
            </Text>
          </View>

          <BlurView
            intensity={25}
            tint="dark"
            style={[
              styles.linhaBadge,
              item.origem === "app"
                ? styles.badgeApp
                : styles.badgeMapa,
            ]}
          >
            <MaterialCommunityIcons
              name={
                item.origem ===
                "app"
                  ? "star"
                  : "earth"
              }
              size={10}
              color="#fff"
            />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#1A1333",
          Colors.background,
        ]}
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 10,
          },
        ]}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.headerTop}
        >
          <BlurView
            intensity={30}
            tint="dark"
            style={styles.backButton}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </BlurView>

          <View>
            <Text
              style={
                styles.headerTitle
              }
            >
              Explorar Eventos
            </Text>

            <Text
              style={
                styles.headerSub
              }
            >
              Descubra experiências
              incríveis ✨
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(
            120
          ).springify()}
        >
          <BlurView
            intensity={45}
            tint="dark"
            style={
              styles.searchBox
            }
          >
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={
                Colors.textMuted
              }
            />

            <TextInput
              placeholder="Buscar eventos, locais..."
              placeholderTextColor={
                Colors.textMuted
              }
              value={query}
              onChangeText={
                setQuery
              }
              style={
                styles.input
              }
            />

            {query.length >
              0 && (
              <TouchableOpacity
                onPress={() =>
                  setQuery("")
                }
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={
                    Colors.textMuted
                  }
                />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        <Animated.ScrollView
          horizontal
          entering={FadeIn.delay(
            250
          )}
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.abas
          }
        >
          {ABAS.map((aba) => {
            const ativo =
              abaAtiva ===
              aba.key;

            return (
              <Animated.View
                key={aba.key}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.aba,
                    ativo &&
                      styles.abaAtiva,
                  ]}
                  onPress={() =>
                    setAbaAtiva(
                      aba.key
                    )
                  }
                >
                  <Text
                    style={[
                      styles.abaText,
                      ativo &&
                        styles.abaTextAtiva,
                    ]}
                  >
                    {aba.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </LinearGradient>

      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <SkeletonContent
            containerStyle={{
              flex: 1,
              padding: 16,
              paddingTop: 24,
            }}
            isLoading={loading}
            layout={[
              {
                width:
                  SCREEN_WIDTH *
                  0.72,
                height: 360,
                borderRadius: 28,
                marginBottom: 24,
              },

              {
                width:
                  SCREEN_WIDTH *
                  0.72,
                height: 360,
                borderRadius: 28,
                marginBottom: 24,
              },
            ]}
          />
        </View>
      ) : (
        <Animated.ScrollView
          entering={FadeIn.duration(
            500
          )}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          <View
            style={
              styles.sectionRow
            }
          >
            <Text
              style={styles.section}
            >
              Categorias
            </Text>
          </View>

          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.chips
            }
          >
            {CATEGORIAS.map(
              (cat, index) => {
                const ativo =
                  categoriaSelecionada ===
                  cat.nome;

                return (
                  <Animated.View
                    key={cat.nome}
                    entering={FadeInRight.delay(
                      index * 60
                    ).springify()}
                    layout={Layout.springify()}
                  >
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        ativo &&
                          styles.chipActive,
                      ]}
                      onPress={() =>
                        toggleCategoria(
                          cat.nome
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name={
                          cat.icon
                        }
                        size={16}
                        color={
                          ativo
                            ? Colors.background
                            : Colors.primary
                        }
                      />

                      <Text
                        style={[
                          styles.chipText,
                          ativo &&
                            styles.chipTextActive,
                        ]}
                      >
                        {cat.nome}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }
            )}
          </Animated.ScrollView>

          <View
            style={
              styles.sectionRow
            }
          >
            <Text
              style={styles.section}
            >
              Eventos
            </Text>

            <Text
              style={styles.count}
            >
              {
                eventosFiltrados.length
              }{" "}
              encontrados
            </Text>
          </View>

          {query ? (
            eventosFiltrados.map(
              (
                item,
                index
              ) => (
                <LinhaEvento
                  key={item.id}
                  item={item}
                  index={index}
                />
              )
            )
          ) : (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.cardsRow
              }
              snapToInterval={
                CARD_W + 16
              }
              decelerationRate="fast"
              onScroll={useAnimatedScrollHandler(
                {
                  onScroll: (
                    event
                  ) => {
                    scrollX.value =
                      event
                        .contentOffset
                        .x;
                  },
                }
              )}
              scrollEventThrottle={
                16
              }
            >
              {eventosFiltrados.map(
                (
                  item,
                  index
                ) => (
                  <CardEvento
                    key={item.id}
                    item={item}
                    index={index}
                  />
                )
              )}
            </Animated.ScrollView>
          )}
        </Animated.ScrollView>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
      >
        <Animated.View
          entering={FadeIn.duration(
            200
          )}
          style={
            styles.modalOverlay
          }
        >
          <Animated.View
            entering={FadeInDown.springify()}
          >
            <BlurView
              intensity={70}
              tint="dark"
              style={
                styles.modalCard
              }
            >
              <LinearGradient
                colors={[
                  Colors.primary,
                  "#7B5CFF",
                ]}
                style={
                  styles.modalIcon
                }
              >
                <MaterialCommunityIcons
                  name="earth"
                  size={36}
                  color="#fff"
                />
              </LinearGradient>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Evento Público
              </Text>

              <Text
                style={
                  styles.modalText
                }
              >
                Procure mais
                informações no site
                da Secretaria da
                Cultura do Ceará.
              </Text>

              <TouchableOpacity
                style={
                  styles.modalButton
                }
                onPress={() =>
                  setModalVisible(
                    false
                  )
                }
              >
                <LinearGradient
                  colors={[
                    Colors.primary,
                    "#7B5CFF",
                  ]}
                  style={
                    styles.modalGradient
                  }
                >
                  <Text
                    style={
                      styles.modalButtonText
                    }
                  >
                    Entendi
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    header: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },

    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },

    backButton: {
      width: 48,
      height: 48,
      borderRadius: 18,
      justifyContent:
        "center",
      alignItems: "center",
      overflow: "hidden",
      marginRight: 14,
    },

    headerTitle: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "800",
    },

    headerSub: {
      color:
        Colors.textMuted,
      marginTop: 4,
      fontSize: 13,
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 22,
      overflow: "hidden",
      paddingHorizontal: 16,
      paddingVertical: 15,
      marginBottom: 18,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.06)",
    },

    input: {
      flex: 1,
      color: "#fff",
      marginLeft: 10,
      fontSize: 15,
    },

    abas: {
      flexDirection: "row",
      gap: 10,
    },

    aba: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 22,
      backgroundColor:
        Colors.surface,
    },

    abaAtiva: {
      backgroundColor:
        Colors.primary,
    },

    abaText: {
      color:
        Colors.textSecondary,
      fontWeight: "600",
    },

    abaTextAtiva: {
      color: "#fff",
    },

    sectionRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginTop: 24,
      marginBottom: 14,
    },

    section: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "800",
    },

    count: {
      color:
        Colors.textMuted,
      fontSize: 12,
    },

    chips: {
      paddingHorizontal: 16,
      gap: 10,
      flexDirection: "row",
    },

    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        Colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      gap: 6,
    },

    chipActive: {
      backgroundColor:
        Colors.primary,
    },

    chipText: {
      color: "#fff",
      fontWeight: "600",
      textTransform:
        "capitalize",
    },

    chipTextActive: {
      color:
        Colors.background,
    },

    cardsRow: {
      paddingHorizontal: 16,
      gap: 16,
      flexDirection: "row",
    },

    card: {
      width: CARD_W,
      height: 370,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor:
        Colors.card,
    },

    img: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    badge: {
      position: "absolute",
      top: 16,
      left: 16,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 30,
      gap: 5,
      overflow: "hidden",
    },

    badgeApp: {
      backgroundColor:
        Colors.primary +
        "CC",
    },

    badgeMapa: {
      backgroundColor:
        "rgba(0,0,0,0.40)",
    },

    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
    },

    cardInfo: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 18,
    },

    metricsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 10,
    },

    metric: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    metricText: {
      color: "#fff",
      fontSize: 12,
    },

    titulo: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "800",
      lineHeight: 30,
    },

    descricao: {
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 13,
      marginTop: 8,
      lineHeight: 19,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },

    local: {
      color:
        "rgba(255,255,255,0.85)",
      marginLeft: 4,
      flex: 1,
      fontSize: 13,
    },

    linha: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 14,
      backgroundColor:
        Colors.surface,
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        Colors.border,
    },

    linhaImg: {
      width: 82,
      height: 82,
    },

    linhaInfo: {
      flex: 1,
      padding: 12,
    },

    linhaTitulo: {
      color:
        Colors.textPrimary,
      fontWeight: "700",
      fontSize: 14,
    },

    linhaLocal: {
      color:
        Colors.textSecondary,
      marginTop: 4,
      fontSize: 12,
    },

    linhaCategoria: {
      color:
        Colors.textMuted,
      marginTop: 3,
      fontSize: 11,
      textTransform:
        "capitalize",
    },

    linhaBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
      overflow: "hidden",
    },

    loadingContainer: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.70)",
      justifyContent:
        "center",
      alignItems: "center",
      padding: 24,
    },

    modalCard: {
      width: "100%",
      borderRadius: 30,
      padding: 28,
      alignItems: "center",
      overflow: "hidden",
      backgroundColor:
        "rgba(25,25,35,0.85)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.06)",
    },

    modalIcon: {
      width: 78,
      height: 78,
      borderRadius: 39,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 20,
    },

    modalTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 10,
    },

    modalText: {
      color:
        Colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      fontSize: 15,
    },

    modalButton: {
      marginTop: 24,
      width: "100%",
    },

    modalGradient: {
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
    },

    modalButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });