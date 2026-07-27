import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Callout,
} from "react-native-maps";
import * as Location from "expo-location";
import globalService from "../../Services/globalService";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../../Context/i18n";

const CustomMarker = React.memo(({ marker, isSelected, onSelect }) => {
  return (
    <Marker
      coordinate={{
        latitude: marker.latitude,
        longitude: marker.longitude,
      }}
      onPress={() => onSelect(marker.id)}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <Entypo name="location-pin" size={40} color="red" />
        {isSelected && (
          <View style={styles.markerDetails}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => onSelect(marker.id)}
              style={styles.closeButton}
            >
              <AntDesign name="closecircle" size={16} color="gray" />
            </TouchableOpacity>
            {/* Rotated Image */}
            <Image
              style={styles.markerImage}
              source={{ uri: marker.selfieUrl }}
              resizeMode="cover" // Changed to 'cover' for better filling
            />
            {/* User Text and Heart Icon */}
            <View style={styles.textContainer}>
              <Text style={styles.userText}>
                {marker.firstUserId.firstname || "Unknown"}
              </Text>
              <AntDesign name="heart" size={12} color="red" />
              <Text style={styles.userText}>
                {marker.secondUserId.firstname || "Unknown"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Marker>
  );
});

const MapScreen = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [helloConnections, setHelloConnections] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };

  useFocusEffect(
    React.useCallback(() => {
      getHelloConnections();
    }, [navigation])
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLocation(currentLocation);
      setIsLoading(false);
    })();
  }, []);

  const handleMarkerSelect = (markerId) => {
    console.log(markerId, "iddd.>>>>");
    setSelectedMarkerId((prevId) => (prevId === markerId ? null : markerId));
  };

  const getHelloConnections = () => {
    globalService
      .grabHelloConnections()
      .then((res) => {
        const connectionsWithId = res.map((connection, index) => ({
          ...connection,
          id: connection._id || index,
        }));
        setHelloConnections(connectionsWithId);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  const onRegionChange = (region) => {
    console.log(region);
  };

  const filteredConnections = helloConnections?.filter(
    (connection) => connection?.firstUserId && connection?.secondUserId
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headrecontainer}>
        <TouchableOpacity onPress={goBack}>
          <Image
            style={{
              width: 35,
              height: 35,
              resizeMode: "contain",
            }}
            source={require("../../assets/btnbtn.png")}
          />
        </TouchableOpacity>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 18,
            fontWeight: "900",
            fontFamily: "Roboto-Regular",
            color: "#000000",
          }}
        >
          {i18n.t("global.hellomap")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation?.openDrawer();
          }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        initialRegion && (
          <View style={{ flex: 1 }}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={initialRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              provider={
                Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
              }
              ref={mapRef}
              onRegionChangeComplete={onRegionChange}
            >
              {filteredConnections?.map((marker) => (
                <CustomMarker
                  key={marker.id}
                  marker={marker}
                  isSelected={selectedMarkerId === marker.id}
                  onSelect={handleMarkerSelect}
                />
              ))}
            </MapView>
          </View>
        )
      )}
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
    marginBottom: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerDetails: {
    marginTop: 5,
    width: 150, // Increased width to accommodate larger image
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10, // Increased padding for better spacing
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
    pointerEvents: "auto", // Ensure touch events are handled
  },
  markerImage: {
    width: 100, // Increased from 80 to 100
    height: 100, // Increased from 80 to 100
    marginBottom: 5, // Space between image and text
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  userText: {
    fontFamily: "Roboto-Regular",
    fontSize: 15,
    marginHorizontal: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },
});
