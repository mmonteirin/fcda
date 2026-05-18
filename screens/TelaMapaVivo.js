import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../styles/Colors";
import { useMap } from "../hooks/useMap";
import MapFilter from "../components/MapFilter";
import HeatmapLegend from "../components/HeatmapLegend";
import MapEventMarker from "../components/MapEventMarker";

const INITIAL_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function TelaMapaVivo({ navigation }) {
  const {
    currentLocation,
    mapEvents,
    heatmapData,
    culturalHotspots,
    loading,
    selectedGenre,
    setSelectedGenre,
    startLocationTracking,
    loadMapEvents,
    loadHeatmapData,
  } = useMap();

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showEventsList, setShowEventsList] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const mapViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startLocationTracking();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadMapEvents();
      loadHeatmapData();
    }
  }, [currentLocation, selectedGenre]);

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleHeatmapToggle = () => {
    setShowHeatmap(!showHeatmap);
  };

  const handleCurrentLocation = () => {
    if (currentLocation) {
      mapViewRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const renderEventsList = () => {
    return (
      <FlatList
        data={mapEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventListItem}
            onPress={() => {
              handleEventPress(item);
              setShowEventsList(false);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.eventListHeader}>
              <Text style={styles.eventListTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.eventListBadge}>
                <Text style={styles.eventListDistance}>
                  {item.distance?.toFixed(1)}km
                </Text>
              </View>
            </View>
            <Text style={styles.eventListGenre}>{item.genre}</Text>
            <View style={styles.eventListStats}>
              <MaterialCommunityIcons
                name="check-circle"
                size={14}
                color={Colors.success}
              />
              <Text style={styles.eventListStat}>
                {item.checkInsCount} check-ins
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <MaterialCommunityIcons
              name="map-search"
              size={40}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyListText}>
              Nenhum evento próximo
            </Text>
          </View>
        }
        scrollEnabled={true}
        style={styles.eventsList}
      />
    );
  };

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Localizando você...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          ...currentLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        followsUserLocation={false}
      >
        {/* HEATMAP - CÍRCULOS */}
        {showHeatmap &&
          culturalHotspots.map((hotspot, index) => (
            <Circle
              key={index}
              center={{
                latitude: hotspot.latitude,
                longitude: hotspot.longitude,
              }}
              radius={500 + hotspot.intensity * 100}
              fillColor={`rgba(${
                hotspot.intensity > 50 ? "255, 0, 0" : "255, 200, 0"
              }, 0.2)`}
              strokeColor={`rgba(${
                hotspot.intensity > 50 ? "255, 0, 0" : "255, 200, 0"
              }, 0.5)`}
              strokeWidth={2}
            />
          ))}

        {/* EVENT MARKERS */}
        {mapEvents.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.location.latitude,
              longitude: event.location.longitude,
            }}
            onPress={() => handleEventPress(event)}
          >
            <MapEventMarker
              {...event}
              onPress={() => handleEventPress(event)}
              isSelected={selectedEvent?.id === event.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* FILTER BAR */}
      <View style={styles.filterContainer}>
        <MapFilter
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          showHeatmap={showHeatmap}
          onHeatmapToggle={handleHeatmapToggle}
        />
      </View>

      {/* HEATMAP LEGEND */}
      {showHeatmap && (
        <View style={styles.legendContainer}>
          <HeatmapLegend />
        </View>
      )}

      {/* EVENTS COUNT */}
      {mapEvents.length > 0 && (
        <View style={styles.eventsCountContainer}>
          <TouchableOpacity
            style={styles.eventsCountButton}
            onPress={() => setShowEventsList(!showEventsList)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="list-box"
              size={20}
              color={Colors.textPrimary}
            />
            <Text style={styles.eventsCountText}>
              {mapEvents.length} eventos
            </Text>
            <MaterialCommunityIcons
              name={showEventsList ? "chevron-down" : "chevron-up"}
              size={20}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* EVENTS LIST SHEET */}
      {showEventsList && (
        <View style={styles.bottomSheetContainer}>
          {renderEventsList()}
        </View>
      )}

      {/* BUTTONS */}
      <View style={styles.buttonsContainer}>
        {/* CURRENT LOCATION BUTTON */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleCurrentLocation}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        {/* EVENT DETAIL BUTTON */}
        {selectedEvent && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigation.navigate("MapaVivoEventoDetalhes", {
                eventId: selectedEvent.id,
              });
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        )}

        {/* CHECK-IN BUTTON */}
        {selectedEvent && (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => {
              navigation.navigate("MapaVivoCheckIn", {
                eventId: selectedEvent.id,
                eventTitle: selectedEvent.title,
              });
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={Colors.textPrimary}
            />
            <Text style={styles.checkInButtonText}>Check-in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterContainer: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 15, 20, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legendContainer: {
    position: "absolute",
    bottom: 170,
    right: 16,
    width: 200,
  },
  eventsCountContainer: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
  },
  eventsCountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventsCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "40%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  eventsList: {
    paddingVertical: 12,
  },
  eventListItem: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  eventListTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  eventListBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventListDistance: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  eventListGenre: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  eventListStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventListStat: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  emptyList: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyListText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textMuted,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 20,
    right: 16,
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkInButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
