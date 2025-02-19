import { View, Text, Image } from "react-native";

import images from "@/constants/images";
import icons from "@/constants/icons";
import { Models } from "react-native-appwrite";

interface Props {
  item: Models.Document;
}

const Comment = ({ item }: Props) => {
  console.log(item);
  return (
    <View className="flex flex-col items-start">
      <View className="flex flex-row items-center">
        <Image
          source={{ uri: item.avatar }}
          className="w-14 h-14 rounded-full"
        />
        <Text className="text-base text-black-300 text-start font-rubik-bold ml-3">
          {item.name} ({item.rating})
        </Text>
      </View>

      <Text className="text-black-200  text-base font-rubik mt-2">
        {item.review}
      </Text>

      <View className="flex flex-row items-center w-full justify-end mt-4">
        {/* <View className="flex flex-row items-center">
          <Image
            source={icons.heart}
            className="w-5 h-5"
            tintColor={"#0061FF"}
          />
          <Text className="text-black-300 text-sm font-rubik-medium ml-2">
            120
          </Text>
        </View> */}
        <Text className="text-black-100 ms-auto text-sm font-rubik">
          {new Date(item.$createdAt).toDateString()}
        </Text>
      </View>
    </View>
  );
};

export default Comment;
