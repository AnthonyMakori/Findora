import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Star, Calendar, MessageSquare } from "lucide-react-native";

export default function HistoryPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch("/api/ratings/list?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }
      const data = await response.json();
      setRatings(data.ratings || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? "#FFD700" : "#4B5563"}
        fill={index < rating ? "#FFD700" : "#4B5563"}
      />
    ));
  };

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              Your Ratings
            </Text>
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>
              {ratings.length} {ratings.length === 1 ? "place" : "places"}{" "}
              reviewed
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : ratings.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <Star size={64} color="#1F1F1F" fill="#1F1F1F" />
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 18,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No ratings yet
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Visit places and share your experience!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {ratings.map((rating) => (
            <TouchableOpacity
              key={rating.id}
              onPress={() =>
                router.push({
                  pathname: "/rate/[businessId]",
                  params: {
                    businessId: rating.business_id,
                    businessName: rating.business_name,
                  },
                })
              }
              style={{
                backgroundColor: "#121212",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#1F1F1F",
              }}
            >
              {/* Business Name */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  marginBottom: 12,
                }}
              >
                {rating.business_name}
              </Text>

              {/* Rating */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {renderStars(rating.user_rating)}
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    marginLeft: 8,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {rating.user_rating}.0
                </Text>
              </View>

              {/* Review */}
              {rating.user_review && (
                <View
                  style={{
                    backgroundColor: "#1F1F1F",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <MessageSquare size={14} color="#8A2BE2" />
                    <Text
                      style={{
                        color: "#8A2BE2",
                        fontSize: 12,
                        fontWeight: "600",
                        marginLeft: 6,
                      }}
                    >
                      Your Review
                    </Text>
                  </View>
                  <Text
                    style={{ color: "#D1D5DB", fontSize: 14, lineHeight: 20 }}
                  >
                    {rating.user_review}
                  </Text>
                </View>
              )}

              {/* Date */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Calendar size={14} color="#6B7280" />
                <Text style={{ color: "#6B7280", fontSize: 12, marginLeft: 6 }}>
                  {new Date(rating.visited_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
