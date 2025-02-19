import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import images from "@/constants/images";
import { facilities } from "@/constants/data";
import { Rating, AirbnbRating } from "react-native-ratings";

import { createReviewAndUpdateProperty, getPropertyById } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrrite";
import Comment from "@/components/Comment";
import { useState } from "react";
import { useGlobalContext } from "@/lib/global-provider";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "@/components/MapComponent";

const Property = () => {
  const [showAllReview, setShowAllReview] = useState(false);
  const [loadingReviewButton, setLoadingReviewButton] = useState(false);
  const { user } = useGlobalContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [showAddReview, setShowAddReview] = useState(false);
  const windowHeight = Dimensions.get("window").height;
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  const { data: property, loading }: { data: any; loading: boolean } =
    useAppwrite({
      fn: getPropertyById,
      params: {
        id: id!,
        userId: user?.$id!,
      },
    });

  console.log(user);
  const handleAddReview = async () => {
    const result = await createReviewAndUpdateProperty(
      user?.name!,
      user?.avatar!,
      review,
      rating,
      property.$id
    );
    if (result) {
      setShowAddReview(false);
      getPropertyById({ id: id!, userId: user?.$id! });
    }
    setShowAddReview(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="text-primary-300" size="large" />
      </View>
    );
  }
  return (
    <View>
      {/* <Modal visible={true}>
        {" "}
        <TouchableWithoutFeedback>
          <View className="flex-1 justify-center  bg-black/50">
            <View className="rounded-2xl p-6 px-5 mx-4 bg-white"></View>
            <SafeAreaView style={{ flex: 1 }}>
              <MapComponent latitude={37.7749} longitude={-122.4194} />
            </SafeAreaView>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
      <Modal
        onRequestClose={() => setShowAddReview(false)}
        transparent
        visible={showAddReview}
        animationType="slide"
      >
        {" "}
        <TouchableWithoutFeedback onPress={() => setShowAddReview(false)}>
          <View className="flex-1 justify-center  bg-black/50">
            <View className="rounded-2xl p-6 px-5 mx-4 bg-white">
              <View className="flex flex-row items-center justify-center">
                <Rating
                  showRating
                  startingValue={rating}
                  onFinishRating={(value: number) => {
                    setRating(value);
                  }}
                  style={{ paddingVertical: 10 }}
                  ratingTextColor="black"
                />
              </View>
              <View className="flex flex-row">
                <Text className="text-black-300 text-xl font-rubik-bold text-start">
                  Review
                </Text>
              </View>
              <View className="flex  border border-primary-300 min-h-[60px] rounded-[8px] flex-row items-center justify-center">
                <TextInput
                  style={{ color: "black" }}
                  className="flex-1    text-white font-semibold text-base"
                  value={review}
                  onChangeText={(value: string) => setReview(value)}
                  placeholder={"Write a review"}
                  placeholderTextColor="#7b7b8b"
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setLoadingReviewButton(true);
                  handleAddReview();
                }}
                className=" mt-4 items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
              >
                {!loadingReviewButton ? (
                  <Text className="text-white text-lg text-center font-rubik-bold">
                    Submit
                  </Text>
                ) : (
                  <View className="text-white text-lg text-center font-rubik-bold">
                    <ActivityIndicator className="text-white" size="large" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        onRequestClose={() => setShowAllReview(false)}
        transparent
        visible={showAllReview}
        animationType="slide"
      >
        {" "}
        <TouchableWithoutFeedback onPress={() => setShowAllReview(false)}>
          {/* <ScrollView> */}
          <View className="flex-1 justify-center  bg-black/50">
            <View className="rounded-2xl p-6 px-5 mx-4 bg-white">
              {property?.reviews &&
                property?.reviews.map((item: any, index: number) => (
                  <View key={index} className="mt-5">
                    <Comment item={item} />
                  </View>
                ))}
            </View>
          </View>
          {/* </ScrollView> */}
        </TouchableWithoutFeedback>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 bg-white"
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <Image
            source={{ uri: property?.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex flex-row items-center w-full justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full w-11 h-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>

              <View className="flex flex-row items-center gap-3">
                <Image
                  source={icons.heart}
                  className="w-7 h-7"
                  tintColor={"#191D31"}
                />
                <Image source={icons.send} className="w-7 h-7" />
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold">
            {property?.name}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="w-5 h-5" />
              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                {property?.rating} ({property?.reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full w-10 h-10">
              <Image source={icons.bed} className="w-4 h-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bedrooms} Beds
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full w-10 h-10 ml-7">
              <Image source={icons.bath} className="w-4 h-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bathrooms} Baths
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full w-10 h-10 ml-7">
              <Image source={icons.area} className="w-4 h-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.area} sqft
            </Text>
          </View>

          <View className="w-full border-t border-primary-200 pt-7 mt-5">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Agent
            </Text>

            <View className="flex flex-row items-center justify-between mt-4">
              <View className="flex flex-row items-center">
                <Image
                  source={{ uri: property?.agent.avatar }}
                  className="w-14 h-14 rounded-full"
                />

                <View className="flex flex-col items-start justify-center ml-3">
                  <Text className="text-lg text-black-300 text-start font-rubik-bold">
                    {property?.agent.name}
                  </Text>
                  <Text className="text-sm text-black-200 text-start font-rubik-medium">
                    {property?.agent.email}
                  </Text>
                </View>
              </View>

              <View className="flex flex-row items-center gap-3">
                <Image source={icons.chat} className="w-7 h-7" />
                <Image source={icons.phone} className="w-7 h-7" />
              </View>
            </View>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2">
              {property?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Facilities
            </Text>

            {property?.facilities.length > 0 && (
              <View className="flex flex-row flex-wrap items-start justify-start  mt-2 gap-5">
                {property?.facilities.map((item: string, index: number) => {
                  const facility = facilities.find(
                    (facility) => facility.title === item
                  );

                  return (
                    <View
                      key={index}
                      className="flex-col items-center  min-w-16 max-w-20"
                    >
                      <View className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <Image
                          source={facility ? facility.icon : icons.info}
                          className="w-6 h-6"
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-black-300 text-sm text-center font-rubik mt-1.5"
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {property?.gallery.length > 0 && (
            <View className="mt-7">
              <Text className="text-black-300 text-xl font-rubik-bold">
                Gallery
              </Text>
              <FlatList
                contentContainerStyle={{ paddingRight: 20 }}
                data={property?.gallery}
                keyExtractor={(item) => item.$id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.image }}
                    className="w-40 h-40 rounded-xl"
                  />
                )}
                contentContainerClassName="flex gap-4 mt-3"
              />
            </View>
          )}

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Location
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              <Image source={icons.location} className="w-7 h-7" />
              <Text className="text-black-200 text-sm font-rubik-medium">
                {property?.address}
              </Text>
            </View>

            <Image
              source={images.map}
              className="h-52 w-full mt-5 rounded-xl"
            />
          </View>

          {/* {property?.reviews.length > 0 && ( */}
          <View className="mt-7">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Image source={icons.star} className="w-6 h-6" />
                <Text className="text-black-300 text-xl font-rubik-bold ml-2">
                  {property?.reviews.length > 0 ? property?.rating : "N/A"} (
                  {property?.reviews.length} reviews)
                </Text>
              </View>

              {property?.reviews.length > 1 && (
                <TouchableOpacity onPress={() => setShowAllReview(true)}>
                  <Text className="text-primary-300 text-base font-rubik-bold">
                    View All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {property?.reviews[0] && (
              <View className="mt-5">
                <Comment item={property?.reviews[0]} />
              </View>
            )}
            <View className="mt-5">
              <TouchableOpacity
                onPress={() => setShowAddReview(true)}
                className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
              >
                <Text className="text-white text-lg text-center font-rubik-bold">
                  Add Review
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* )} */}
        </View>
      </ScrollView>

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className="text-black-200 text-xs font-rubik-medium">
              Price
            </Text>
            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              ${property?.price}
            </Text>
          </View>

          <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
            <Text className="text-white text-lg text-center font-rubik-bold">
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Property;
