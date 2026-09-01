import FeaturedCard, { FeaturedCardSkeleton } from "@/components/featured-card";
import PropertyCard, { PropertyCardSkeleton } from "@/components/property-card";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RecommendedItem = Property | { id: string; isSkeleton: true };

const skeletonData: RecommendedItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: `skeleton-${i}`,
  isSkeleton: true,
}));

const HomeScreen = () => {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [fetchingRecommended, setFetchingRecommended] = useState(false);
  const [fetchingFeatured, setFetchingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState("");
  const [recommendedError, setRecommendedError] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchFeaturedProperties();
      fetchRecommendedProperties();
    }, []),
  );

  const fetchFeaturedProperties = async () => {
    setFetchingFeatured(true);

    const { data: featuredData, error: featuredError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (featuredError) {
      console.error("Error fetching featured properties:", featuredError);
      setFeaturedError("Failed to load featured properties.");
    }

    setFeatured(featuredData ?? []);
    setFetchingFeatured(false);
    setFeaturedError("");
  };

  const fetchRecommendedProperties = async () => {
    setFetchingRecommended(true);

    const { data: recommendedData, error: recommendedError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });

    if (recommendedError) {
      console.error("Error fetching recommended properties:", recommendedError);
      setRecommendedError("Failed to load recommended properties.");
    }
    setRecommended(recommendedData ?? []);
    setFetchingRecommended(false);
    setRecommendedError("");
  };

  const recommendedData: RecommendedItem[] = fetchingRecommended
    ? skeletonData
    : recommended;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={recommendedData}
        keyExtractor={(item, index) =>
          "isSkeleton" in item
            ? `recommended-skeleton-${index}`
            : (item as Property).id
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("../../../assets/images/kribb.png")}
                style={{ width: 90, height: 36 }}
                resizeMode="contain"
              />
              <View className="items-end">
                <Text className="text-gray-500 text-xs">Good morning 👋</Text>
                <Text className="text-gray-900 text-base font-bold">
                  {user?.firstName ?? "User"}
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="mx-5 mb-6 flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm flex-1">
                Search properties, cities...
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                className="w-8 h-8 bg-blue-600 rounded-xl items-center justify-center"
              >
                <Ionicons name="options-outline" size={15} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
                Featured
              </Text>

              {fetchingFeatured ? (
                <FlatList
                  data={[1, 2, 3]}
                  keyExtractor={(item) => `featured-skeleton-${item}`}
                  renderItem={() => <FeaturedCardSkeleton />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              ) : featuredError ? (
                <View className="items-center py-10">
                  <Text className="text-gray-400 text-center">
                    {featuredError}
                  </Text>

                  <TouchableOpacity
                    onPress={fetchFeaturedProperties}
                    className="mt-2"
                  >
                    <Text className="text-blue-600 text-center">Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              )}
            </View>

            {/* Recommended Header */}
            <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          fetchingRecommended ? (
            <View className="px-5">
              <PropertyCardSkeleton />
            </View>
          ) : (
            <View className="px-5">
              <PropertyCard property={item as Property} showSave/>
            </View>
          )
        }
        ListEmptyComponent={
          !fetchingRecommended && !recommendedError ? (
            <View className="items-center py-10">
              <Text className="text-gray-400">No properties found</Text>
            </View>
          ) : !fetchingRecommended && recommendedError ? (
            <View className="items-center py-10">
              <Text className="text-gray-400 text-center">
                {recommendedError}
              </Text>
              <TouchableOpacity
                onPress={fetchRecommendedProperties}
                className="mt-2"
              >
                <Text className="text-blue-600 text-center">Try again</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
