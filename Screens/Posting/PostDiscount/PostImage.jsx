import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ProfileHeader from "../../../Component/ProfileHeader";
import MeetupHeadersec from "../../../Component/MeetupHeadersec";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import meetupService from "../../../Services/meetupService";
import axios from "axios";
import PosingHeader from "../../../Component/PosingHeader";
import DiscountService from "../../../Services/DiscountService";
import { UploadImage } from "../../../Context/helper";
import PosingDiscountHeader from "../../../Component/PosingDiscountHeader";
import { useSelector } from "react-redux";
import LocationPermissionModal from "../../../Component/LocationPermissionModal";
import i18n from "../../../Context/i18n";

generatePattern = () => {
  const currentDate = new Date();

  // Get current date components
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = this.padZero(currentDate.getMonth() + 1);
  const day = this.padZero(currentDate.getDate());

  // Get current time components
  const hours = this.padZero(currentDate.getHours());
  const minutes = this.padZero(currentDate.getMinutes());
  const seconds = this.padZero(currentDate.getSeconds());

  // Construct the pattern
  const pattern = `HA-${day}/${month}/${year}-${hours}:${minutes}:${seconds}.png`;

  console.log(pattern); // Output the pattern to console or use it as needed
  return pattern;
};

padZero = (num) => {
  return num < 10 ? "0" + num : num;
};

const PostImage = () => {
  const PostDiscount = useSelector(
    (state) => state?.discount?.DiscountData?.postDiscount
  );
  console.log(PostDiscount?._id, "discout Id2 is this");
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const clearform = router?.params?.clearform;
  const selectedDate = router?.params?.selectedDate;
  const startTime = router?.params?.startTime;
  const endTime = router?.params?.endTime;

  console.log(
    from,
    from2,
    from3,
    from4,
    pathname,
    clearform,
    selectedDate,
    startTime,
    endTime,
    "p5"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStoragePermissionModal, setShowStoragePermissionModal] =
    useState(false);
  const [imageuploadLoading, setImageuploadLoading] = useState(true);
  const [imageLink, setImageLink] = useState(null);
  const [showError, setShowError] = useState(false);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  console.log(showError, "errrr");

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    if (clearform) {
      setSelectedImage(null);
      setShowError(false);
      setImageLink(null);
      setImageuploadLoading(true);
    }
    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [router]);

  useFocusEffect(
    React.useCallback(() => {
      const requestPermission = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          setShowStoragePermissionModal(true);
          // Alert.alert(
          //   "Permission Required",
          //   "Please grant permission to access the camera roll to upload images."
          // );
        }
      };

      requestPermission();
    }, [])
  );

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
      });

      console.log(result);

      if (!result.canceled) {
        const url = result?.assets?.[0]?.uri;
        console.log(url, "image ressss");
        setSelectedImage(result?.assets?.[0]?.uri);
        let response = await UploadImage(url);
        setImageLink(response?.response_body?.Location);
        setShowError(false);
        setImageuploadLoading(false);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleSibmit = () => {
    if (!imageLink) {
      setShowError(true);
      return;
    }
    setIsLoading(true);
    // imageLink
    const body = {
      featureImage: imageLink,
      isComplete: true,
    };

    // DiscountService.updateDiscountImage(router?.params?.discountId, body)
    DiscountService.updateDiscountImage(PostDiscount?._id, body)
      .then((res) => {
        const params = {
          from: from,
          from2: from2,
          from3: from3,
          from4: from4,
          from5: pathname,
          clearform: true,
        };
        navigation.navigate("PostPayment", params);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("error: ", err);
        setIsLoading(false);
      });
  };

  const handlePermissionClose = () => {
    setShowStoragePermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowStoragePermissionModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
  };

  const handleBack = () => {
    navigation.navigate(from4, { from: from, from2: from2, from3: from3 });
  };

  return (
    <>
      {showStoragePermissionModal ? (
        <LocationPermissionModal
          visible={showStoragePermissionModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ImageBackground
            source={require("../../../assets/ImageBackground.jpg")}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              flex: 1,
              left: 0,
              top: 0,
            }}
          >
            <View style={styles.container}>
              <PosingDiscountHeader handleBack={handleBack} />

              <Image
                source={require("../../../assets/camera.png")}
                style={styles.camlogo}
              />
              <Text style={styles.subHeaderText}>Upload Photo</Text>
              <TouchableOpacity
                onPress={handleImagePick}
                style={{ width: "12%", alignSelf: "center" }}
              >
                {selectedImage ? (
                  imageuploadLoading ? (
                    <ActivityIndicator size={30} color="#0000ff" />
                  ) : (
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.image}
                    />
                  )
                ) : (
                  <Image
                    source={require("../../../assets/uplodeimagee.jpg")}
                    style={styles.image}
                  />
                )}
              </TouchableOpacity>
              {showError && (
                <Text style={styles.errorText}>
                  {i18n.t("global.pleaseuploadImage")}
                </Text>
              )}

              {isLoading ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      position: "absolute",
                      alignItems: "center",
                      alignSelf: "center",
                      bottom: 10,
                    }}
                  >
                    <ActivityIndicator size={50} color="#0000ff" />
                  </View>
                </>
              ) : (
                <>
                  {isKeyboardOpen ? null : (
                    <TouchableOpacity
                      onPress={handleSibmit}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        position: "absolute",
                        alignItems: "center",
                        alignSelf: "center",
                        bottom: 10,
                      }}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity onPress={handleSibmit}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={styles.textbtn}>
                              {" "}
                              {i18n.t("global.next")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </ImageBackground>
        </SafeAreaView>
      )}
    </>
  );
};

export default PostImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 150,
    height: 130,
    borderRadius: 7,
  },
  buton: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  camlogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 80,
    marginTop: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});
