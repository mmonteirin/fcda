import React, {
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";

import { BlurView } from "expo-blur";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  limit,
  getDocs,
  query,
} from "firebase/firestore";

import { db } from "../firebaseConfig";

import { useAuth } from "../context/AuthContext";

import { Colors } from "../styles/Colors";

import {
  getUserFeedLikes,
  toggleEventoLike,
} from "../services/feedService";

const { width } =
  Dimensions.get("window");

const PAGE_SIZE = 10;

const DEFAULT_EVENT_IMAGE =
  "https://placehold.co/600x600/1B1D26/6C5CE7?text=Evento";

const STORIES = [
  {
    id: 1,
    emoji: "🎭",
    nome: "Teatro",
  },
  {
    id: 2,
    emoji: "🎵",
    nome: "Música",
  },
  {
    id: 3,
    emoji: "🎨",
    nome: "Arte",
  },
  {
    id: 4,
    emoji: "🎪",
    nome: "Festival",
  },
  {
    id: 5,
    emoji: "🎬",
    nome: "Cinema",
  },
];

const AVATARS_FIXOS = [
  "https://i.pravatar.cc/300?img=11",
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=13",
  "https://i.pravatar.cc/300?img=14",
  "https://i.pravatar.cc/300?img=15",
  "https://i.pravatar.cc/300?img=16",
];

const LikeButton = memo(
  ({ isLiked, onPress }) => {
    const scale =
      useSharedValue(1);

    const animatedStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            scale:
              scale.value,
          },
        ],
      }));

    const handlePress =
      () => {
        scale.value =
          withSpring(1.3);

        setTimeout(() => {
          scale.value =
            withSpring(1);
        }, 120);

        onPress();
      };

    return (
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View
          style={animatedStyle}
        >
          <MaterialCommunityIcons
            name={
              isLiked
                ? "heart"
                : "heart-outline"
            }
            size={27}
            color={
              isLiked
                ? "#A855F7"
                : Colors.textPrimary
            }
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

const EventoCard = memo(
  ({
    item,
    index,
    isLiked,
    isAdmin,
    currentUserId,
    formatarNumero,
    formatarData,
    onToggleLike,
    onDelete,
    onNavigate,
    onComprarIngresso,
  }) => {
    const scale =
      useSharedValue(1);

    const animatedStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            scale:
              scale.value,
          },
        ],
      }));

    const avatarUri =
      AVATARS_FIXOS[
        index %
          AVATARS_FIXOS.length
      ];

    return (
      <Animated.View
        entering={FadeInUp.delay(
          index * 80
        ).springify()}
      >
        <Animated.View
          style={animatedStyle}
        >
          <TouchableOpacity
            activeOpacity={0.95}
            onPressIn={() => {
              scale.value =
                withSpring(0.98);
            }}
            onPressOut={() => {
              scale.value =
                withSpring(1);
            }}
            style={styles.card}
          >
            {/* HEADER */}
            <View
              style={
                styles.cardHeader
              }
            >
              <View
                style={
                  styles.userInfo
                }
              >
                <Image
                  source={{
                    uri: avatarUri,
                  }}
                  style={
                    styles.avatar
                  }
                />

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    numberOfLines={
                      1
                    }
                    style={
                      styles.userName
                    }
                  >
                    {item.adminNome ||
                      "Organizador"}
                  </Text>

                  <View
                    style={
                      styles.locationRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={12}
                      color={
                        Colors.primary
                      }
                    />

                    <Text
                      numberOfLines={
                        1
                      }
                      style={
                        styles.locationText
                      }
                    >
                      {item.localEvento ||
                        item.nomeLocal ||
                        "Local não informado"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={
                  styles.headerActions
                }
              >
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={
                    styles.dateBadge
                  }
                >
                  <Text
                    style={
                      styles.dateText
                    }
                  >
                    {formatarData(
                      item.createdAt
                    )}
                  </Text>
                </BlurView>

                {isAdmin &&
                  item.uidEvento ===
                    currentUserId && (
                    <TouchableOpacity
                      style={
                        styles.deleteBtn
                      }
                      onPress={() =>
                        onDelete(
                          item.id
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color={
                          Colors.error
                        }
                      />
                    </TouchableOpacity>
                  )}
              </View>
            </View>

            {/* IMAGE */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                onNavigate(item)
              }
              style={
                styles.imageWrapper
              }
            >
              <Image
                source={{
                  uri:
                    item.imagemEvento ||
                    DEFAULT_EVENT_IMAGE,
                }}
                style={
                  styles.mainImage
                }
                resizeMode="cover"
              />

              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0,0,0,0.95)",
                ]}
                style={
                  styles.imageOverlay
                }
              >
                {item.dataEvento && (
                  <BlurView
                    intensity={
                      40
                    }
                    tint="dark"
                    style={
                      styles.eventDateBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={12}
                      color="#fff"
                    />

                    <Text
                      style={
                        styles.eventDateText
                      }
                    >
                      {
                        item.dataEvento
                      }
                    </Text>
                  </BlurView>
                )}

                <Text
                  numberOfLines={2}
                  style={
                    styles.eventTitle
                  }
                >
                  {item.tituloEvento ||
                    "Evento"}
                </Text>

                <Text
                  numberOfLines={2}
                  style={
                    styles.description
                  }
                >
                  {item.descricao}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ACTIONS */}
            <View
              style={
                styles.actions
              }
            >
              <View
                style={
                  styles.leftActions
                }
              >
                <LikeButton
                  isLiked={
                    isLiked
                  }
                  onPress={() =>
                    onToggleLike(
                      item.id
                    )
                  }
                />

                <TouchableOpacity
                  style={
                    styles.actionBtn
                  }
                  onPress={() =>
                    onNavigate(
                      item
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={25}
                    color={
                      Colors.textPrimary
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.actionBtn
                  }
                >
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={24}
                    color={
                      Colors.textPrimary
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={
                  styles.ingressoBtn
                }
                onPress={() =>
                  onComprarIngresso(
                    item
                  )
                }
              >
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={16}
                  color="#fff"
                />

                <Text
                  style={
                    styles.ingressoBtnText
                  }
                >
                  Ingressos
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.metricsContainer
              }
            >
              <Text
                style={
                  styles.likesText
                }
              >
                {formatarNumero(
                  item.likes || 0
                )}{" "}
                curtidas
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }
);

export default function TelaFeed({
  navigation,
}) {
  const insets =
    useSafeAreaInsets();

  const { user, isAdmin } =
    useAuth();

  const [eventos, setEventos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [likedIds, setLikedIds] =
    useState([]);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    eventoExcluir,
    setEventoExcluir,
  ] = useState(null);

  useEffect(() => {
    carregarFeed();
    carregarLikes();
  }, []);

  const carregarLikes =
    async () => {
      try {
        if (!user?.uid) return;

        const likes =
          await getUserFeedLikes(
            user.uid
          );

        setLikedIds(likes);
      } catch (e) {
        console.log(e);
      }
    };

  const carregarFeed =
    async () => {
      try {
        const q = query(
          collection(
            db,
            "eventos"
          ),
          orderBy(
            "createdAt",
            "desc"
          ),
          limit(PAGE_SIZE)
        );

        const snapshot =
          await getDocs(q);

        const lista =
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (item) =>
                item.id !==
                "_init"
            );

        setEventos(lista);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

  const toggleLike =
    useCallback(
      async (eventoId) => {
        try {
          const liked =
            await toggleEventoLike(
              eventoId,
              user.uid
            );

          if (liked) {
            setLikedIds(
              (prev) => [
                ...prev,
                eventoId,
              ]
            );
          } else {
            setLikedIds(
              (prev) =>
                prev.filter(
                  (id) =>
                    id !==
                    eventoId
                )
            );
          }
        } catch (e) {
          console.log(e);
        }
      },
      [user]
    );

  const abrirModalExcluir =
    (id) => {
      setEventoExcluir(id);
      setModalVisible(true);
    };

  const confirmarExcluir =
    async () => {
      try {
        await deleteDoc(
          doc(
            db,
            "eventos",
            eventoExcluir
          )
        );

        setEventos((prev) =>
          prev.filter(
            (e) =>
              e.id !==
              eventoExcluir
          )
        );

        setModalVisible(false);
      } catch (e) {
        console.log(e);
      }
    };

  const formatarNumero =
    (num) => {
      if (!num) return "0";

      if (num >= 1000) {
        return (
          (num / 1000).toFixed(
            1
          ) + "K"
        );
      }

      return num.toString();
    };

  const formatarData =
    (timestamp) => {
      if (!timestamp)
        return "Agora";

      const data =
        timestamp.toDate?.() ||
        new Date(timestamp);

      const diff =
        Date.now() -
        data.getTime();

      const min = Math.floor(
        diff / 60000
      );

      const h = Math.floor(
        diff / 3600000
      );

      const d = Math.floor(
        diff / 86400000
      );

      if (min < 1)
        return "Agora";

      if (min < 60)
        return `${min}m`;

      if (h < 24)
        return `${h}h`;

      if (d < 7)
        return `${d}d`;

      return data.toLocaleDateString(
        "pt-BR"
      );
    };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            Colors.primary
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          "#18122B",
          "#10131F",
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
          style={
            styles.headerContent
          }
        >
          <View>
            <Text
              style={
                styles.logo
              }
            >
              MonitoraCult
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Descubra eventos
              incríveis ✨
            </Text>
          </View>

          <View
            style={
              styles.headerRight
            }
          >
            <TouchableOpacity
              style={
                styles.headerIconBtn
              }
              onPress={() =>
                navigation.navigate(
                  "CriarPost"
                )
              }
            >
              <MaterialCommunityIcons
                name="plus-box-outline"
                size={26}
                color="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.headerIconBtn
              }
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={25}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* STORIES */}
        <Animated.View
          entering={FadeInRight.delay(
            120
          ).springify()}
        >
          <FlatList
            horizontal
            data={STORIES}
            keyExtractor={(
              item
            ) =>
              item.id.toString()
            }
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.storiesBar
            }
            renderItem={({
              item,
            }) => (
              <TouchableOpacity
                style={
                  styles.storyItem
                }
              >
                <LinearGradient
                  colors={[
                    Colors.primary,
                    "#A855F7",
                  ]}
                  style={
                    styles.storyRing
                  }
                >
                  <View
                    style={
                      styles.storyAvatar
                    }
                  >
                    <Text
                      style={{
                        fontSize: 24,
                      }}
                    >
                      {
                        item.emoji
                      }
                    </Text>
                  </View>
                </LinearGradient>

                <Text
                  style={
                    styles.storyLabel
                  }
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </LinearGradient>

      {/* FEED */}
      <FlatList
        data={eventos}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom:
            insets.bottom +
            120,
          paddingTop: 16,
        }}
        renderItem={({
          item,
          index,
        }) => (
          <EventoCard
            item={item}
            index={index}
            isLiked={likedIds.includes(
              item.id
            )}
            isAdmin={isAdmin}
            currentUserId={
              user?.uid
            }
            formatarNumero={
              formatarNumero
            }
            formatarData={
              formatarData
            }
            onToggleLike={
              toggleLike
            }
            onDelete={
              abrirModalExcluir
            }
            onNavigate={(
              evento
            ) =>
              navigation.navigate(
                "Detalhes",
                {
                  evento,
                }
              )
            }
            onComprarIngresso={(
              evento
            ) =>
              navigation.navigate(
                "TelaIngressos",
                {
                  evento,
                }
              )
            }
          />
        )}
      />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <BlurView
            intensity={50}
            tint="dark"
            style={
              styles.modalCard
            }
          >
            <LinearGradient
              colors={[
                "rgba(239,68,68,0.15)",
                "rgba(127,29,29,0.05)",
              ]}
              style={
                styles.modalGradient
              }
            >
              <View
                style={
                  styles.modalIcon
                }
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={34}
                  color="#EF4444"
                />
              </View>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Excluir evento?
              </Text>

              <Text
                style={
                  styles.modalText
                }
              >
                Você realmente
                deseja excluir
                este evento?
                Essa ação não
                poderá ser
                desfeita.
              </Text>

              <View
                style={
                  styles.modalButtons
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.cancelBtn
                  }
                  onPress={() =>
                    setModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.cancelText
                    }
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.confirmBtn
                  }
                  onPress={
                    confirmarExcluir
                  }
                >
                  <LinearGradient
                    colors={[
                      "#EF4444",
                      "#DC2626",
                    ]}
                    style={
                      styles.confirmGradient
                    }
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color="#FFF"
                    />

                    <Text
                      style={
                        styles.confirmText
                      }
                    >
                      Excluir
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
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

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        Colors.background,
    },

    header: {
      paddingBottom: 22,
    },

    headerContent: {
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    logo: {
      color: "#FFF",
      fontSize: 32,
      fontWeight: "bold",
    },

    subtitle: {
      color:
        Colors.textSecondary,
      marginTop: 6,
    },

    headerRight: {
      flexDirection: "row",
      gap: 6,
    },

    headerIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "rgba(255,255,255,0.08)",
    },

    storiesBar: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },

    storyItem: {
      alignItems: "center",
      marginRight: 16,
    },

    storyRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent:
        "center",
      alignItems: "center",
    },

    storyAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        Colors.surface,
      justifyContent:
        "center",
      alignItems: "center",
    },

    storyLabel: {
      color:
        Colors.textSecondary,
      marginTop: 7,
      fontSize: 12,
    },

    card: {
      backgroundColor:
        Colors.surface,
      marginHorizontal: 16,
      marginBottom: 22,
      borderRadius: 28,
      overflow: "hidden",
    },

    cardHeader: {
      padding: 14,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },

    userName: {
      color:
        Colors.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    locationText: {
      color:
        Colors.textMuted,
      fontSize: 12,
      marginLeft: 4,
    },

    headerActions: {
      alignItems: "flex-end",
    },

    dateBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      overflow: "hidden",
    },

    dateText: {
      color: "#FFF",
      fontSize: 11,
      fontWeight: "700",
    },

    deleteBtn: {
      paddingTop: 8,
    },

    imageWrapper: {
      width: "100%",
      height: 420,
      backgroundColor:
        "#000",
    },

    mainImage: {
      width: "100%",
      height: "100%",
    },

    imageOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 18,
    },

    eventDateBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 10,
    },

    eventDateText: {
      color: "#FFF",
      marginLeft: 5,
      fontSize: 11,
      fontWeight: "700",
    },

    eventTitle: {
      color: "#FFF",
      fontSize: 26,
      fontWeight: "bold",
    },

    description: {
      color:
        "rgba(255,255,255,0.75)",
      marginTop: 10,
      lineHeight: 20,
      fontSize: 13,
    },

    actions: {
      paddingHorizontal: 8,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    leftActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    actionBtn: {
      padding: 8,
    },

    ingressoBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        Colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 6,
    },

    ingressoBtnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 13,
      marginLeft: 5,
    },

    metricsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    likesText: {
      color:
        Colors.textPrimary,
      fontWeight: "700",
      fontSize: 13,
    },

    /* MODAL */
    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.65)",

      justifyContent:
        "center",

      alignItems: "center",

      paddingHorizontal: 24,
    },

    modalCard: {
      width: "100%",
      borderRadius: 30,
      overflow: "hidden",

      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.08)",
    },

    modalGradient: {
      padding: 28,
      alignItems: "center",
    },

    modalIcon: {
      width: 78,
      height: 78,

      borderRadius: 30,

      backgroundColor:
        "rgba(239,68,68,0.12)",

      justifyContent:
        "center",

      alignItems: "center",

      marginBottom: 18,
    },

    modalTitle: {
      color: "#FFF",
      fontSize: 22,
      fontWeight: "bold",
    },

    modalText: {
      color:
        "rgba(255,255,255,0.65)",

      textAlign: "center",

      marginTop: 10,

      fontSize: 14,
      lineHeight: 22,
    },

    modalButtons: {
      flexDirection: "row",

      marginTop: 26,

      width: "100%",
    },

    cancelBtn: {
      flex: 1,

      height: 52,

      borderRadius: 18,

      backgroundColor:
        "rgba(255,255,255,0.06)",

      justifyContent:
        "center",

      alignItems: "center",

      marginRight: 10,
    },

    cancelText: {
      color: "#FFF",
      fontWeight: "600",
    },

    confirmBtn: {
      flex: 1,
    },

    confirmGradient: {
      height: 52,

      borderRadius: 18,

      flexDirection: "row",

      justifyContent:
        "center",

      alignItems: "center",

      gap: 8,
    },

    confirmText: {
      color: "#FFF",
      fontWeight: "bold",
    },
  });