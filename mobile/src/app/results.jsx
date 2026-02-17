import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Filter,
  SlidersHorizontal,
} from "lucide-react-native";

export default function ResultsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { query, latitude, longitude } = params;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    openNow: false,
    maxDistance: 10,
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchQuery = `${query} near me`;
      const response = await fetch(
        `/integrations/local-business-data/search?query=${encodeURIComponent(searchQuery)}&lat=${latitude}&lng=${longitude}&limit=50`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Calculate distance and rank results
        const rankedResults = data.data
          .map((place) => {
            const distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              place.latitude,
              place.longitude,
            );

            return {
              ...place,
              distance,
              rankScore: calculateRankScore(
                place.rating || 0,
                place.review_count || 0,
                distance,
              ),
            };
          })
          .sort((a, b) => b.rankScore - a.rankScore);

        setResults(rankedResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Unable to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const calculateRankScore = (rating, reviewCount, distance) => {
    // Weighted scoring: rating (50%), review count (30%), distance (20%)
    const ratingScore = (rating / 5) * 50;
    const reviewScore = Math.min((reviewCount / 100) * 30, 30);
    const distanceScore = Math.max(20 - distance * 2, 0);
    return ratingScore + reviewScore + distanceScore;
  };

  const applyFilters = (result) => {
    if (filters.minRating > 0 && (result.rating || 0) < filters.minRating) {
      return false;
    }
    if (filters.openNow && result.business_status !== "OPEN") {
      return false;
    }
    if (result.distance > filters.maxDistance) {
      return false;
    }
    return true;
  };

  const filteredResults = results.filter(applyFilters);

  const handleResultPress = (result) => {
    router.push({
      pathname: "/details",
      params: {
        businessId: result.business_id,
        name: result.name,
        rating: result.rating || 0,
        reviewCount: result.review_count || 0,
        address: result.full_address || result.address || "",
        phone: result.phone_number || "",
        website: result.website || "",
        latitude: result.latitude,
        longitude: result.longitude,
        distance: result.distance.toFixed(2),
        photoUrl: result.photos_sample?.[0]?.photo_url || "",
        userLat: latitude,
        userLng: longitude,
      },
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text style={{ color: "#FFFFFF", marginTop: 16, fontSize: 16 }}>
          Finding best {query}...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: "#121212",
          borderBottomWidth: 1,
          borderBottomColor: "#1F1F1F",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF" }}
              >
                {query}
              </Text>
              <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>
                {filteredResults.length} results found
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setFilterOpen(!filterOpen)}
            style={{
              backgroundColor: filterOpen ? "#8A2BE2" : "#1F1F1F",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <SlidersHorizontal size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {filterOpen && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: "#1F1F1F",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Filters
            </Text>

            {/* Min Rating Filter */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                Minimum Rating
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[0, 3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() =>
                      setFilters({ ...filters, minRating: rating })
                    }
                    style={{
                      flex: 1,
                      backgroundColor:
                        filters.minRating === rating ? "#8A2BE2" : "#121212",
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
                      {rating === 0 ? "Any" : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Open Now Filter */}
            <TouchableOpacity
              onPress={() =>
                setFilters({ ...filters, openNow: !filters.openNow })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#121212",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 14 }}>Open Now</Text>
              <View
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: filters.openNow ? "#8A2BE2" : "#374151",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#FFFFFF",
                    alignSelf: filters.openNow ? "flex-end" : "flex-start",
                  }}
                />
              </View>
            </TouchableOpacity>

            {/* Distance Filter */}
            <View>
              <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                Within {filters.maxDistance} km
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[5, 10, 20, 50].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    onPress={() =>
                      setFilters({ ...filters, maxDistance: distance })
                    }
                    style={{
                      flex: 1,
                      backgroundColor:
                        filters.maxDistance === distance
                          ? "#8A2BE2"
                          : "#121212",
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
                      {distance}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Results List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={{ color: "#EF4444", fontSize: 16, textAlign: "center" }}
            >
              {error}
            </Text>
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={{ color: "#9CA3AF", fontSize: 16, textAlign: "center" }}
            >
              No results found. Try adjusting your filters.
            </Text>
          </View>
        ) : (
          filteredResults.map((result, index) => (
            <TouchableOpacity
              key={result.business_id}
              onPress={() => handleResultPress(result)}
              style={{
                backgroundColor: "#121212",
                borderRadius: 16,
                marginBottom: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#1F1F1F",
              }}
            >
              {/* Rank Badge */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  backgroundColor: index < 3 ? "#8A2BE2" : "#1F1F1F",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                  shadowColor: "#8A2BE2",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: index < 3 ? 0.5 : 0,
                  shadowRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </Text>
              </View>

              {/* Image */}
              {result.photos_sample?.[0]?.photo_url && (
                <Image
                  source={{ uri: result.photos_sample[0].photo_url }}
                  style={{ width: "100%", height: 180 }}
                  contentFit="cover"
                />
              )}

              {/* Content */}
              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  {result.name}
                </Text>

                {/* Rating & Reviews */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        marginLeft: 4,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {result.rating ? result.rating.toFixed(1) : "N/A"}
                    </Text>
                  </View>
                  <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                    ({result.review_count || 0} reviews)
                  </Text>
                </View>

                {/* Distance */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <MapPin size={16} color="#8A2BE2" />
                  <Text
                    style={{ color: "#9CA3AF", marginLeft: 6, fontSize: 14 }}
                  >
                    {result.distance.toFixed(2)} km away
                  </Text>
                </View>

                {/* Type */}
                {result.type && (
                  <View
                    style={{
                      backgroundColor: "#1F1F1F",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: "#8A2BE2",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {result.type}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
