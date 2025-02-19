import React from "react";
import { View, Image, StyleSheet } from "react-native";
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setAccessToken(
  "pk.eyJ1IjoiYWJkb2NvZGUiLCJhIjoiY2xodDUxeGZqMG1yMTNtbzBvOTM3bHB2byJ9.s5dQOR9QKm2nallRtGJzyg"
);

const MapComponent = ({ latitude, longitude }: any) => {
  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} zoomEnabled={true}>
        <MapboxGL.Camera
          centerCoordinate={[longitude, latitude]}
          zoomLevel={14} // Adjust zoom level as needed
        />

        {/* Marker with Custom Image */}
        <MapboxGL.PointAnnotation
          coordinate={[longitude, latitude]}
          id="marker"
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            }}
            style={styles.markerImage}
          />
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 40, // Adjust size as needed
    height: 40,
    resizeMode: "contain",
  },
});

export default MapComponent;
