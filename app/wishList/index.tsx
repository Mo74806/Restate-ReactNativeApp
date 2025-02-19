import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, FeaturedCard } from "@/components/Card";
import NoResults from "@/components/NoResult";
import Search from "@/components/Search";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import Filters from "@/components/Filters";
import seed from "@/lib/seed";
import { useAppwrite } from "@/lib/useAppwrrite";
import {
  getLatestProperties,
  getProperties,
  getWishlistForUser,
} from "@/lib/appwrite";
import { router, useLocalSearchParams } from "expo-router";

const index = () => {
  const { user } = useGlobalContext();

  const { data, loading } = useAppwrite({
    fn: getWishlistForUser,
    params: {
      userId: user ? user?.$id! : "",
    },
  });
  console.log(data);
  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={data}
        numColumns={2}
        renderItem={({ item }) => (
          <Card
            user={user?.$id!}
            item={item.propertyId}
            onPress={() => handleCardPress(item.propertyId.$id)}
          />
        )}
        keyExtractor={(item: any) => item.$id}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center  mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full w-11 h-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>

              <View className="flex flex-row ms-2 justify-self-start">
                <Image
                  source={{ uri: user?.avatar }}
                  className="w-12 h-12 rounded-full"
                />

                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik text-black-100">
                    Good Morning
                  </Text>
                  <Text className="text-base font-rubik-medium text-black-300">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <Image
                source={icons.bell}
                className="w-6 h-6 justify-self-end flex ms-auto"
              />
            </View>

            <View className="">
              <Text className="text-2xl font-rubik-bold text-black-300 mt-5">
                Your Wishlist
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default index;
