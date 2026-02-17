import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  MapPin,
  TrendingUp,
  History,
  X,
  Star,
} from "lucide-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_HISTORY_KEY = "@amenity_finder_history";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular amenity types
  const popularAmenities = [
    { name: "Restaurants", icon: "🍽️" },
    { name: "Hospitals", icon: "🏥" },
    { name: "Gyms", icon: "💪" },
    { name: "Car Yards", icon: "🚗" },
    { name: "Coffee Shops", icon: "☕" },
    { name: "Pharmacies", icon: "💊" },
  ];

  useEffect(() => {
    requestLocationPermission();
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const saveToHistory = async (query) => {
    try {
      const newHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(newHistory),
      );
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const requestLocationPermission = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby amenities.",
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again.",
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        Alert.alert("Empty Search", "Please enter an amenity type to search.");
        return;
      }

      if (!location) {
        Alert.alert(
          "Location Required",
          "Please enable location services to search for nearby amenities.",
        );
        return;
      }

      saveToHistory(query);
      router.push({
        pathname: "/results",
        params: {
          query: query,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    },
    [location, router],
  );

  const fetchSuggestions = async (text) => {
    if (!text.trim() || !location) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/integrations/google-place-autocomplete/autocomplete/json?input=${encodeURIComponent(text)}&radius=5000`,
      );
      const data = await response.json();

      if (data.predictions) {
        setSuggestions(data.predictions.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);
    setShowSuggestions(true);
    fetchSuggestions(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: "#FFFFFF",
              }}
            >
              Amenity Finder
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/history")}
              style={{
                backgroundColor: "#121212",
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#8A2BE2",
              }}
            >
              <Star size={24} color="#8A2BE2" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
            Discover the best places near you
          </Text>
        </View>

        {/* Location Status */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: "#121212",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#8A2BE2",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={20} color="#8A2BE2" />
              <Text
                style={{
                  color: "#FFFFFF",
                  marginLeft: 8,
                  fontSize: 14,
                  flex: 1,
                }}
              >
                {locationLoading
                  ? "Getting your location..."
                  : location
                    ? "Location detected"
                    : "Location unavailable"}
              </Text>
              {locationLoading && (
                <ActivityIndicator size="small" color="#8A2BE2" />
              )}
            </View>
            {!location && !locationLoading && (
              <TouchableOpacity
                onPress={requestLocationPermission}
                style={{
                  marginTop: 12,
                  backgroundColor: "#8A2BE2",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}
                >
                  Enable Location
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              backgroundColor: "#121212",
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 2,
              borderColor: searchQuery ? "#8A2BE2" : "#1F1F1F",
            }}
          >
            <Search size={22} color="#8A2BE2" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: "#FFFFFF",
              }}
              placeholder="Search for amenities..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleTextChange}
              onSubmitEditing={() => handleSearch(searchQuery)}
              onFocus={() => setShowSuggestions(true)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View
              style={{
                backgroundColor: "#121212",
                borderRadius: 16,
                marginTop: 8,
                borderWidth: 1,
                borderColor: "#1F1F1F",
                overflow: "hidden",
              }}
            >
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={suggestion.place_id}
                  onPress={() => {
                    setSearchQuery(suggestion.structured_formatting.main_text);
                    setShowSuggestions(false);
                    handleSearch(suggestion.structured_formatting.main_text);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                    borderBottomColor: "#1F1F1F",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    {suggestion.structured_formatting.main_text}
                  </Text>
                  {suggestion.structured_formatting.secondary_text && (
                    <Text
                      style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}
                    >
                      {suggestion.structured_formatting.secondary_text}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => handleSearch(searchQuery)}
            disabled={!searchQuery.trim() || !location}
            style={{
              marginTop: 16,
              backgroundColor:
                searchQuery.trim() && location ? "#8A2BE2" : "#1F1F1F",
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              shadowColor: "#8A2BE2",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: searchQuery.trim() && location ? 0.3 : 0,
              shadowRadius: 12,
            }}
          >
            <Text
              style={{
                color: searchQuery.trim() && location ? "#FFFFFF" : "#6B7280",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Search Nearby
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Amenities */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TrendingUp size={20} color="#8A2BE2" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginLeft: 8,
              }}
            >
              Popular Searches
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {popularAmenities.map((amenity) => (
              <TouchableOpacity
                key={amenity.name}
                onPress={() => {
                  setSearchQuery(amenity.name);
                  handleSearch(amenity.name);
                }}
                style={{
                  backgroundColor: "#121212",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#8A2BE2",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>
                  {amenity.icon}
                </Text>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "500" }}
                >
                  {amenity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <History size={20} color="#8A2BE2" />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  Recent Searches
                </Text>
              </View>
              <TouchableOpacity onPress={clearHistory}>
                <Text
                  style={{ color: "#8A2BE2", fontSize: 14, fontWeight: "600" }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSearchQuery(item);
                    handleSearch(item);
                  }}
                  style={{
                    backgroundColor: "#121212",
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#1F1F1F",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 15 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
