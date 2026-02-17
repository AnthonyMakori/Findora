import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import {
  ArrowLeft,
  Navigation,
  Clock,
  TrendingUp,
  Zap,
  MapPin,
} from "lucide-react-native";

export default function DirectionsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);

  const { name, destLat, destLng, userLat, userLng } = params;

  const [selectedRoute, setSelectedRoute] = useState("fastest");
  const [loading, setLoading] = useState(false);

  const origin = {
    latitude: parseFloat(userLat),
    longitude: parseFloat(userLng),
  };

  const destination = {
    latitude: parseFloat(destLat),
    longitude: parseFloat(destLng),
  };

  // Calculate straight-line distance
  const calculateDistance = () => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(destination.latitude - origin.latitude);
    const dLon = toRad(destination.longitude - origin.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(origin.latitude)) *
        Math.cos(toRad(destination.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const distance = calculateDistance();
  const estimatedTime = Math.ceil((distance / 50) * 60); // Rough estimate: 50 km/h average

  useEffect(() => {
    // Fit map to show both markers
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates([origin, destination], {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, []);

  const handleStartNavigation = () => {
    const scheme = Platform.select({
      ios: "maps:",
      android: "google.navigation:",
    });

    const url = Platform.select({
      ios: `${scheme}?daddr=${destLat},${destLng}`,
      android: `${scheme}q=${destLat},${destLng}`,
    });

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&origin=${userLat},${userLng}`,
      );
    });
  };

  const routeOptions = [
    {
      id: "fastest",
      label: "Fastest",
      icon: Zap,
      time: estimatedTime,
      distance: distance.toFixed(1),
      color: "#8A2BE2",
    },
    {
      id: "shortest",
      label: "Shortest",
      icon: TrendingUp,
      time: Math.ceil(estimatedTime * 1.1),
      distance: (distance * 0.95).toFixed(1),
      color: "#10B981",
    },
  ];

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#373737" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta:
              Math.abs(origin.latitude - destination.latitude) * 2 || 0.05,
            longitudeDelta:
              Math.abs(origin.longitude - destination.longitude) * 2 || 0.05,
          }}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={origin}
            title="Your Location"
            pinColor="#3B82F6"
          />

          {/* Destination Marker */}
          <Marker coordinate={destination} title={name} pinColor="#8A2BE2" />

          {/* Route Line */}
          <Polyline
            coordinates={[origin, destination]}
            strokeColor="#8A2BE2"
            strokeWidth={4}
          />
        </MapView>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 16,
            left: 20,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View
        style={{
          backgroundColor: "#000000",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: "#1F1F1F",
        }}
      >
        {/* Destination Name */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#FFFFFF",
              marginBottom: 4,
            }}
          >
            {name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={16} color="#8A2BE2" />
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 6 }}>
              {distance.toFixed(2)} km away
            </Text>
          </View>
        </View>

        {/* Route Options */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Route Options
          </Text>
          <View style={{ gap: 10 }}>
            {routeOptions.map((route) => {
              const Icon = route.icon;
              const isSelected = selectedRoute === route.id;

              return (
                <TouchableOpacity
                  key={route.id}
                  onPress={() => setSelectedRoute(route.id)}
                  style={{
                    backgroundColor: isSelected ? "#121212" : "#0A0A0A",
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: isSelected ? route.color : "#1F1F1F",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: route.color,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Icon size={20} color="#FFFFFF" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {route.label} Route
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Clock size={14} color="#9CA3AF" />
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        ~{route.time} min
                      </Text>
                      <Text style={{ color: "#4B5563", marginHorizontal: 8 }}>
                        •
                      </Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                        {route.distance} km
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: route.color,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Navigation Button */}
        <TouchableOpacity
          onPress={handleStartNavigation}
          style={{
            backgroundColor: "#8A2BE2",
            paddingVertical: 18,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#8A2BE2",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          <Navigation size={22} color="#FFFFFF" />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 17,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            Start Navigation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
