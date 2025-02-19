import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/Search";
import Filters from "@/components/Filters";

import { getMinMaxPrice, getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrrite";
import { Card } from "@/components/Card";
import NoResults from "@/components/NoResult";

// import RangeSliderRN from "rn-range-slider";
import Thumb from "@/components/Thumb";
import Rail from "@/components/Rail";
import RailSelected from "@/components/RailSelected";
import Label from "@/components/Label";
import Notch from "@/components/Notch";
import RnRangeSlider from "rn-range-slider";
import { categoriesWithoutAll } from "@/constants/data";
import { useGlobalContext } from "@/lib/global-provider";
const Explore = () => {
  const { user } = useGlobalContext();
  const [lowestPrice, setLowestPrice] = useState(0);
  const [highestPrice, setHighestPrice] = useState(0);
  const [selectedPropretyType, setSelectedPropertyType] = useState<any>([]);
  const [homeDetails, setHomeDetails] = useState({
    bedrooms: 0,
    bathrooms: 0,
  });
  const [clearFilter, setClearFilter] = useState(true);
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(
    (value: number) => <Label text={value} />,
    []
  );
  const renderNotch = useCallback(() => <Notch />, []);
  const handleValueChange = (low: number, high: number) => {
    setLowestPrice(low);
    setHighestPrice(high);
  };
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const [moreFilterlistisOpen, setMoreFilterlistIsOpen] = useState(false);
  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      userId: user?.$id!,
      filter: params.filter!,
      query: params.query!,
      propertyType: selectedPropretyType || [],
      lowestPrice: lowestPrice ? lowestPrice : 0,
      highestPrice: highestPrice ? highestPrice : 0,
      bedrooms: homeDetails.bedrooms ? homeDetails.bedrooms : 0,
      bathrooms: homeDetails.bathrooms ? homeDetails.bathrooms : 0,
    },
    skip: true,
  });
  const { data: priceData } = useAppwrite({
    fn: getMinMaxPrice,
  });

  useEffect(() => {
    if (priceData?.minPrice && priceData.maxPrice) {
      setLowestPrice(priceData?.minPrice!);
      setHighestPrice(priceData?.maxPrice!);
    }
  }, [priceData]);
  useEffect(() => {
    refetch({
      userId: user?.$id!,
      filter: params.filter!,
      query: params.query!,
      propertyType: selectedPropretyType || [],
      lowestPrice: lowestPrice ? lowestPrice : 0,
      highestPrice: highestPrice ? highestPrice : 0,
      bedrooms: homeDetails.bedrooms ? homeDetails.bedrooms : 0,
      bathrooms: homeDetails.bathrooms ? homeDetails.bathrooms : 0,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const handleToggleSetSelectedPropertyType = (category: string) => {
    if (selectedPropretyType.includes(category)) {
      setSelectedPropertyType(
        selectedPropretyType.filter((item: any) => item !== category)
      );
    } else {
      setSelectedPropertyType([...selectedPropretyType, category]);
    }
  };

  const handleSetHomeDetails = (type: string, value: number) => {
    setHomeDetails({ ...homeDetails, [type]: value });
  };
  return (
    <SafeAreaView className="h-full bg-white">
      <Modal
        onRequestClose={() => setMoreFilterlistIsOpen(false)}
        transparent
        visible={moreFilterlistisOpen}
        animationType="slide"
      >
        {" "}
        <TouchableWithoutFeedback
          onPress={() => setMoreFilterlistIsOpen(false)}
        >
          <View className="flex-1 justify-end  bg-black/50">
            <View className="rounded-2xl p-6 px-5 bg-white">
              <View className="flex flex-row items-center justify-between mt-5">
                <TouchableOpacity
                  onPress={() => setMoreFilterlistIsOpen(false)}
                  className="flex flex-row bg-primary-200 rounded-full w-11 h-11 items-center justify-center"
                >
                  <Image source={icons.backArrow} className="w-5 h-5" />
                </TouchableOpacity>

                <Text className="w-auto text-base font-rubik-semibold text-black-300">
                  Filter
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setClearFilter(true);
                    setLowestPrice(0);
                    setHighestPrice(0);
                    setSelectedPropertyType([]);
                    setHomeDetails({ bedrooms: 0, bathrooms: 0 });
                  }}
                >
                  <Text className="text-base font-rubik-bold text-primary-300">
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
              {/* price range */}
              {highestPrice && (
                <View className="px-3">
                  <Text className="w-auto text-base font-rubik-semibold text-black-300 mt-5">
                    Price Range
                  </Text>
                  <View
                    pointerEvents="auto"
                    className="flex flex-row items-center justify-between mt-5"
                  >
                    <ScrollView keyboardShouldPersistTaps="handled">
                      <TouchableWithoutFeedback>
                        <RnRangeSlider
                          min={lowestPrice}
                          max={highestPrice}
                          step={1000}
                          floatingLabel
                          renderThumb={renderThumb}
                          renderRail={renderRail}
                          renderRailSelected={renderRailSelected}
                          renderLabel={renderLabel}
                          renderNotch={renderNotch}
                          onValueChanged={(
                            low: number,
                            high: number,
                            byUser
                          ) => {
                            handleValueChange(low, high);
                          }}
                        />
                      </TouchableWithoutFeedback>
                    </ScrollView>
                  </View>
                </View>
              )}
              {/* proprety type */}
              <View className="px-3">
                <Text className="w-auto text-base font-rubik-semibold text-black-300 mt-5">
                  Property Type
                </Text>
                <View
                  pointerEvents="auto"
                  onStartShouldSetResponder={() => {
                    console.log("Touched inside modal");
                    return true;
                  }}
                  className="flex flex-row flex-wrap gap-2 items-center  mt-5"
                >
                  {categoriesWithoutAll.map((item, index) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleToggleSetSelectedPropertyType(item.category)
                      }
                      key={index}
                      className={`flex flex-col items-start  px-4 py-2 rounded-full ${
                        selectedPropretyType.includes(item.category)
                          ? "bg-primary-300"
                          : "bg-primary-100 border border-primary-200"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedPropretyType.includes(item.category)
                            ? "text-white font-rubik-bold mt-0.5"
                            : "text-black-300 font-rubik"
                        }`}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* home Details */}
              <View className="px-3">
                <Text className="w-auto text-base font-rubik-semibold text-black-300 mt-5">
                  Home Details
                </Text>
                <View
                  pointerEvents="auto"
                  onStartShouldSetResponder={() => {
                    console.log("Touched inside modal");
                    return true;
                  }}
                  className="flex flex-row flex-wrap gap-2 items-center justify-between mt-5"
                >
                  <Text className="text-black-200 text-md">Bedrooms</Text>
                  <View className="flex gap-x-8 items-center justify-center flex-row">
                    <TouchableOpacity
                      onPress={() =>
                        homeDetails.bedrooms != 0 &&
                        handleSetHomeDetails(
                          "bedrooms",
                          homeDetails.bedrooms - 1
                        )
                      }
                    >
                      <View className="bg-slate-200  h-7 w-7 flex  justify-center items-center   rounded-full">
                        <Image className="flex" source={icons.dash} />
                      </View>
                    </TouchableOpacity>
                    <Text>{homeDetails.bedrooms}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleSetHomeDetails(
                          "bedrooms",
                          homeDetails.bedrooms + 1
                        )
                      }
                    >
                      <View className="bg-slate-200  h-7 w-7 flex  justify-center items-center   rounded-full">
                        <Image className="flex" source={icons.plus} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex flex-row flex-wrap gap-2 items-center justify-between mt-5 border-t pt-5 border-primary-200">
                  <Text className="text-black-200 text-md">Bathrooms</Text>
                  <View className="flex gap-x-8 items-center justify-center flex-row">
                    <TouchableOpacity
                      onPress={() =>
                        homeDetails.bathrooms != 0 &&
                        handleSetHomeDetails(
                          "bathrooms",
                          homeDetails.bathrooms - 1
                        )
                      }
                    >
                      <View className="bg-slate-200  h-7 w-7 flex  justify-center items-center   rounded-full">
                        <Image className="flex" source={icons.dash} />
                      </View>
                    </TouchableOpacity>
                    <Text>{homeDetails.bathrooms}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleSetHomeDetails(
                          "bathrooms",
                          homeDetails.bathrooms + 1
                        )
                      }
                    >
                      <View className="bg-slate-200  h-7 w-7 flex  justify-center items-center   rounded-full">
                        <Image className="flex" source={icons.plus} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {/* building sizes */}
              {/* <View className="px-3">
                <Text className="w-auto text-base font-rubik-semibold text-black-300 mt-5">
                  Building Size
                </Text>
                <View
                  pointerEvents="auto"
                  onStartShouldSetResponder={() => {
                    console.log("Touched inside modal");
                    return true;
                  }}
                  className="flex flex-row items-center justify-between mt-5"
                >
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <TouchableWithoutFeedback>
                      <RnRangeSlider
                        // style={styles.slider}
                        min={0}
                        max={100}
                        step={1}
                        floatingLabel
                        renderThumb={renderThumb}
                        renderRail={renderRail}
                        renderRailSelected={renderRailSelected}
                        renderLabel={renderLabel}
                        renderNotch={renderNotch}
                        low={low}
                        high={high}
                        onValueChanged={handleValueChange}
                      />
                    </TouchableWithoutFeedback>
                  </ScrollView>
                </View>
              </View> */}

              <TouchableOpacity
                onPress={() => {
                  refetch({
                    userId: user?.$id!,
                    filter: params?.filter!,
                    query: params?.query!,
                    lowestPrice: lowestPrice ? lowestPrice : 0,
                    highestPrice: highestPrice ? highestPrice : 0,
                    bedrooms: homeDetails.bedrooms ? homeDetails.bedrooms : 0,
                    bathrooms: homeDetails.bathrooms
                      ? homeDetails.bathrooms
                      : 0,
                    propertyType: selectedPropretyType!,
                  });
                  setClearFilter(false);
                  setMoreFilterlistIsOpen(false);
                }}
              >
                <View className="mt-7 flex  py-4  justify-center rounded-full bg-primary-300">
                  <Text className="text-white text-center font-rubik-semibold">
                    {" "}
                    Set Filter
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={properties}
        numColumns={2}
        renderItem={({ item }) => (
          <Card
            user={user?.$id!}
            item={item}
            onPress={() => handleCardPress(item.$id)}
          />
        )}
        keyExtractor={(item) => item.$id}
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
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full w-11 h-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>

              <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                Search for Your Ideal Home
              </Text>
              <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <Search handleShowFilter={() => setMoreFilterlistIsOpen(true)} />

            <View className="mt-5">
              {clearFilter && <Filters />}

              <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                Found {properties?.length} Properties
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Explore;
