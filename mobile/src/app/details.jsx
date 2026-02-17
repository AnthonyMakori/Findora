import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Map,
} from "lucide-react-native";

export default function DetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    name,
    rating,
    reviewCount,
    address,
    phone,
    website,
    latitude,
    longitude,
    distance,
    photoUrl,
    userLat,
    userLng,
  } = params;

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("No Phone", "Phone number not available for this location.");
    }
  };

  const handleWebsite = () => {
    if (website) {
      Linking.openURL(website);
    } else {
      Alert.alert("No Website", "Website not available for this location.");
    }
  };

  const handleGetDirections = () => {
    router.push({
      pathname: "/directions",
      params: {
        name,
        destLat: latitude,
        destLng: longitude,
        userLat,
        userLng,
      },
    });
  };

  const handleViewOnMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={20} color="#FFD700" fill="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={20}
            color="#FFD700"
            fill="#FFD700"
            style={{ opacity: 0.5 }}
          />,
        );
      } else {
        stars.push(<Star key={i} size={20} color="#4B5563" fill="#4B5563" />);
      }
    }
    return stars;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={{ position: "relative" }}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={{ width: "100%", height: 300 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 300,
                backgroundColor: "#121212",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MapPin size={64} color="#8A2BE2" />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 16,
              left: 20,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Gradient Overlay */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            }}
          />
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Name */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            {name}
          </Text>

          {/* Rating Section */}
          <View
            style={{
              backgroundColor: "#121212",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#1F1F1F",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {renderStars(parseFloat(rating))}
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 24,
                  fontWeight: "bold",
                  marginLeft: 12,
                }}
              >
                {parseFloat(rating).toFixed(1)}
              </Text>
            </View>
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Based on {reviewCount} reviews
            </Text>
          </View>

          {/* Info Cards */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {/* Distance */}
            <View
              style={{
                backgroundColor: "#121212",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#1F1F1F",
              }}
            >
              <View
                style={{
                  backgroundColor: "#8A2BE2",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <MapPin size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 2 }}
                >
                  Distance
                </Text>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                >
                  {distance} km away
                </Text>
              </View>
            </View>

            {/* Address */}
            {address && (
              <View
                style={{
                  backgroundColor: "#121212",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#1F1F1F",
                }}
              >
                <Text
                  style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 6 }}
                >
                  Address
                </Text>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, lineHeight: 22 }}
                >
                  {address}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            {/* Get Directions - Primary */}
            <TouchableOpacity
              onPress={handleGetDirections}
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
                Get Directions
              </Text>
            </TouchableOpacity>

            {/* Rate This Place Button */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/rate/[businessId]",
                  params: {
                    businessId: params.businessId,
                    businessName: name,
                  },
                })
              }
              style={{
                backgroundColor: "#121212",
                paddingVertical: 18,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#FFD700",
              }}
            >
              <Star size={22} color="#FFD700" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 17,
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
              >
                Rate This Place
              </Text>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Call */}
              <TouchableOpacity
                onPress={handleCall}
                disabled={!phone}
                style={{
                  flex: 1,
                  backgroundColor: phone ? "#121212" : "#0A0A0A",
                  paddingVertical: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: phone ? "#8A2BE2" : "#1F1F1F",
                }}
              >
                <Phone size={20} color={phone ? "#8A2BE2" : "#4B5563"} />
                <Text
                  style={{
                    color: phone ? "#FFFFFF" : "#4B5563",
                    fontSize: 15,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Call
                </Text>
              </TouchableOpacity>

              {/* Website */}
              <TouchableOpacity
                onPress={handleWebsite}
                disabled={!website}
                style={{
                  flex: 1,
                  backgroundColor: website ? "#121212" : "#0A0A0A",
                  paddingVertical: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: website ? "#8A2BE2" : "#1F1F1F",
                }}
              >
                <Globe size={20} color={website ? "#8A2BE2" : "#4B5563"} />
                <Text
                  style={{
                    color: website ? "#FFFFFF" : "#4B5563",
                    fontSize: 15,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Website
                </Text>
              </TouchableOpacity>
            </View>

            {/* View on Map */}
            <TouchableOpacity
              onPress={handleViewOnMap}
              style={{
                backgroundColor: "#121212",
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#1F1F1F",
              }}
            >
              <Map size={20} color="#8A2BE2" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Open in Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
