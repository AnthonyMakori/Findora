import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star, Send } from "lucide-react-native";

export default function RatePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { businessId, businessName } = params;

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    fetchExistingRating();
  }, []);

  const fetchExistingRating = async () => {
    try {
      const response = await fetch(`/api/ratings/get?businessId=${businessId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch rating");
      }
      const data = await response.json();

      if (data.rating) {
        setExistingRating(data.rating);
        setRating(data.rating.user_rating);
        setReview(data.rating.user_review || "");
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a star rating before submitting.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/ratings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          businessName,
          rating,
          review: review.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const data = await response.json();

      Alert.alert(
        "Success!",
        existingRating
          ? "Your rating has been updated."
          : "Thank you for your rating!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
              {existingRating ? "Update Your Rating" : "Rate This Place"}
            </Text>
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>
              Share your experience
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Name */}
        <View
          style={{
            backgroundColor: "#121212",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#1F1F1F",
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 6 }}>
            You're reviewing
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
            {businessName}
          </Text>
        </View>

        {/* Star Rating */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            How would you rate your experience?
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              paddingVertical: 20,
              backgroundColor: "#121212",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: rating > 0 ? "#8A2BE2" : "#1F1F1F",
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={{ padding: 8 }}
              >
                <Star
                  size={40}
                  color={star <= rating ? "#FFD700" : "#4B5563"}
                  fill={star <= rating ? "#FFD700" : "#4B5563"}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 12,
                color: "#8A2BE2",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {rating === 1 && "⭐ Poor"}
              {rating === 2 && "⭐⭐ Fair"}
              {rating === 3 && "⭐⭐⭐ Good"}
              {rating === 4 && "⭐⭐⭐⭐ Very Good"}
              {rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
            </Text>
          )}
        </View>

        {/* Review Text */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Share more details (optional)
          </Text>
          <View
            style={{
              backgroundColor: "#121212",
              borderRadius: 16,
              padding: 16,
              borderWidth: 2,
              borderColor: review.length > 0 ? "#8A2BE2" : "#1F1F1F",
            }}
          >
            <TextInput
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholder="Tell others about your experience..."
              placeholderTextColor="#6B7280"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={6}
            />
          </View>
          <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>
            {review.length} characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
          style={{
            backgroundColor: rating > 0 ? "#8A2BE2" : "#1F1F1F",
            paddingVertical: 18,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#8A2BE2",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: rating > 0 ? 0.4 : 0,
            shadowRadius: 12,
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={20} color={rating > 0 ? "#FFFFFF" : "#6B7280"} />
              <Text
                style={{
                  color: rating > 0 ? "#FFFFFF" : "#6B7280",
                  fontSize: 17,
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
              >
                {existingRating ? "Update Rating" : "Submit Rating"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {existingRating && (
          <Text
            style={{
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            Last updated:{" "}
            {new Date(existingRating.updated_at).toLocaleDateString()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
