import icons from "@/constants/icons";
import images from "@/constants/images";
import { toggleWishlist } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";

interface Props {
  item: Models.Document;
  onPress?: () => void;
  user: string;
}

export const FeaturedCard = ({ item, onPress, user }: Props) => {
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  useEffect(() => {
    setIsInWishlist(item?.isInWishlist);
  }, []);
  const handleToggleAddToWishList = async () => {
    try {
      await toggleWishlist(user, item.$id);
      setIsInWishlist((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-full rounded-2xl"
      />

      <Image
        source={images.cardGradient}
        className="w-full h-full rounded-2xl absolute bottom-0"
      />

      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Image source={icons.star} className="w-3.5 h-3.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1 pt-1">
          {item.rating}
        </Text>
      </View>

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-base font-rubik text-white" numberOfLines={1}>
          {item.address}
        </Text>

        <View className="flex flex-row items-center justify-between w-full">
          <Text className="text-xl font-rubik-extrabold text-white">
            ${item.price}
          </Text>
          <TouchableOpacity onPress={handleToggleAddToWishList}>
            <Image
              source={isInWishlist ? icons.heart2 : icons.heart}
              tintColor={isInWishlist ? "red" : "white"}
              className="w-5 h-5"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({ item, onPress, user }: Props) => {
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  useEffect(() => {
    setIsInWishlist(item?.isInWishlist);
  }, []);
  const handleToggleAddToWishList = async () => {
    try {
      await toggleWishlist(user, item.$id);
      setIsInWishlist((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
        <Image source={icons.star} className="w-2.5 h-2.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5 pt-1">
          {item.rating}
        </Text>
      </View>

      <Image source={{ uri: item.image }} className="w-full h-40 rounded-lg" />

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {item.name}
        </Text>
        <Text className="text-xs font-rubik text-black-100">
          {item.address}
        </Text>

        <View className="flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-primary-300">
            ${item.price}
          </Text>
          <TouchableOpacity onPress={handleToggleAddToWishList}>
            <Image
              className="w-5 h-5 mr-2"
              source={isInWishlist ? icons.heart2 : icons.heart}
              tintColor={isInWishlist ? "red" : "#191D31"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
