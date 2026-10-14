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
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import axios from "axios";
import PosingHeader from "../../Component/PosingHeader";
import DiscountService from "../../Services/DiscountService";
import { UploadImage } from "../../Context/helper";
import BusinessService from "../../Services/BusinessService";
import { useAuth } from "../../Context/AuthContext";
import i18n from "../../Context/i18n";
import PosingHeaderAmbHangout from "../../Component/PosingHeaderAmbHangout";
import Toast from "react-native-toast-message";
import LocationPermissionModal from "../../Component/LocationPermissionModal";

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

const AmbBusinesPostImage = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const clearform = router?.params?.clearform;
  const clearFormAutofill = router?.params?.clearFormAutofill;
  const businessInfo = router?.params?.businessInfo;

  const businessId = router?.params?.businessId || router?.params?.details?.business?.businessId || router?.params?.details?.businessId;

  console.log(from, from2, from3, pathname, clearform, clearFormAutofill, businessInfo, "p4");
  console.log(router?.params?.details?.businessId, router?.params?.details?.business?.businessId, router?.params?.businessId, "bussiness id")
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLink, setImageLink] = useState(null);
  const [showStoragePermissionModal, setShowStoragePermissionModal] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (clearform) {
      setSelectedImage(null)
      setImageLink(null);
    }
  }, [router]);

  const handleSibmit = () => {
    if (imageLink === "" || imageLink === null || imageLink === undefined || !selectedImage) {
      Toast.show({
        type: "error",
        text1: "Pleas Selact a photo",
      });
      return;
    }
    setIsLoading(true);

    console.log({
      businessId: businessId,
      photoUrl: imageLink,
      ambassadorId: user?.user?._id,
    }, "image links")


    BusinessService.uploadPhotoofBussiness({
      businessId: businessId,
      photoUrl: imageLink,
      ambassadorId: user?.user?._id,
    })
      .then((res) => {
        setSelectedImage(null);
        if (res && res?.message === "Business updated") {
          console.log(res, "res is thisssss")
          navigation.navigate("AmbassadorInfoSecond", {
            details: res,
            businessId: businessId,
            from: from,
            from2: from2,
            from3: from3,
            from4: pathname,
            businessInfo: businessInfo
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log("error on handleSibmit: ", err);
        Toast.show({
          type: "error",
          text1: "Photo Upload Error",
        });
        setIsLoading(false);
      });
  };

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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  // useEffect(() => {
  //   requestPermission();
  // }, []);

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
        const uri = result?.assets?.[0]?.uri
        setSelectedImage(uri);
        let response = await UploadImage(uri);
        setImageLink(response?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handlePermissionClose = () => {
    setShowStoragePermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowStoragePermissionModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
  };

  const handleBack = () => {
    const params = {
      from: from,
      from2: from2,
      businessInfo: businessInfo
    }
    navigation.navigate(from3, params);
  }
  return (
    <>
      {showStoragePermissionModal ? (
        <LocationPermissionModal
          visible={showStoragePermissionModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <ImageBackground
            source={require("../../assets/ImageBackground.jpg")}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.container}>
              <PosingHeaderAmbHangout handleBack={handleBack} />

              <Image source={require("../../assets/camera.png")} style={styles.camlogo} />
              <Text style={styles.subHeaderText}>{i18n.t("global.uploadPhoto")}</Text>

              <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
                {selectedImage ? (
                  !imageLink ?
                    (<ActivityIndicator size={30} color="#0000ff" />) :
                    (<Image source={{ uri: selectedImage }} style={styles.image} />)
                ) : (
                  <Image
                    source={require("../../assets/uplodeimagee.jpg")}
                    style={styles.image}
                  />
                )}
              </TouchableOpacity>


              {
                isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size={50} color="#0000ff" />
                  </View>
                ) : (
                  !isKeyboardOpen && (
                    <TouchableOpacity onPress={handleSibmit} style={styles.submitContainer}>
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity onPress={handleSibmit}>
                          <View style={styles.buttonContent}>
                            <Text style={styles.textbtn}>{i18n.t("global.next")}</Text>
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </TouchableOpacity>
                  )
                )
              }
            </View >
          </ImageBackground >
        </SafeAreaView >
      )}
    </>
  );
};

export default AmbBusinesPostImage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
  },
  container: {
    flex: 1,
    paddingTop: 45,
  },
  camlogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 80,
    marginTop: 10,
    borderRadius: 10,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  imagePicker: {
    width: "12%",
    alignSelf: "center",
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 150,
    height: 130,
    borderRadius: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 40,
  },
  submitContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 10,
  },
  button: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  errorText: {
    textAlign: 'center',
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});
