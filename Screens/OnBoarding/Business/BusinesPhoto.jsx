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
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessService from "../../../Services/BusinessService";
import AppConfig from "../../../AppConfig";
import { UploadImage } from "../../../Context/helper";
import Loader from "../../../Component/Loader";
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

const BusinesPhoto = () => {
  // const router = useRoute();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTwo, setSelectedImageTwo] = useState(null);
  const [selectedImageThree, setSelectedImageThree] = useState(null);
  const [selectedImageFour, setSelectedImageFour] = useState(null);
  const [selectedImageFive, setSelectedImageFive] = useState(null);
  const [selectedImageSix, setSelectedImageSix] = useState(null);
  const [selectedImageApi, setSelectedImageApi] = useState(null);
  const [selectedImageTwoApi, setSelectedImageTwoApi] = useState(null);
  const [selectedImageThreeApi, setSelectedImageThreeApi] = useState(null);
  const [selectedImageFourApi, setSelectedImageFourApi] = useState(null);
  const [selectedImageFiveApi, setSelectedImageFiveApi] = useState(null);
  const [selectedImageSixApi, setSelectedImageSixApi] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigation = useNavigation();
  const [showStoragePermissionModal, setShowStoragePermissionModal] =
    useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);

  const [uploadingOne, setUploadingOne] = useState(false);
  const [uploadingTwo, setUploadingTwo] = useState(false);
  const [uploadingThree, setUploadingThree] = useState(false);
  const [uploadingFour, setUploadingFour] = useState(false);
  const [uploadingFive, setUploadingFive] = useState(false);
  const [uploadingSix, setUploadingSix] = useState(false);

  const isDisable =
    uploadingOne ||
    uploadingTwo ||
    uploadingThree ||
    uploadingFour ||
    uploadingFive ||
    uploadingSix;

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);
      let parse_result = JSON.parse(result);
      setBusinessDetails(parse_result);
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

  const goBack = () => {
    navigation.goBack();
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
    setUploadingOne(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImage(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingOne(false);
        }
        setSelectedImageApi(result?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      setUploadingOne(false);
    }
  };
  const handleImagePickTwo = async () => {
    setUploadingTwo(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImageTwo(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingTwo(false);
        }
        setSelectedImageApi(result?.response_body?.Location);
      }
    } catch (error) {
      setUploadingTwo(false);
      console.log("Error 2 picking image:", error);
    }
  };
  const handleImagePickThree = async () => {
    setUploadingThree(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImageThree(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingThree(false);
        }
        setSelectedImageThreeApi(result?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error 3 picking image:", error);
      setUploadingThree(false);
    }
  };
  const handleImagePickFour = async () => {
    setUploadingFour(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImageFour(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingFour(false);
        }
        setSelectedImageFourApi(result?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error 4 picking image:", error);
      setUploadingFour(false);
    }
  };
  const handleImagePickFive = async () => {
    setUploadingFive(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImageFive(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingFive(false);
        }
        setSelectedImageFiveApi(result?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error 5 picking image:", error);
      setUploadingFive(false);
    }
  };
  const handleImagePickSix = async () => {
    setUploadingSix(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        setSelectedImageSix(pickerResult.assets[0].uri);

        let result = await UploadImage(pickerResult.assets[0].uri);
        if (result?.response_body?.Location) {
          setUploadingSix(false);
        }
        setSelectedImageSixApi(result?.response_body?.Location);
      }
    } catch (error) {
      console.log("Error 6 picking image:", error);
      setUploadingSix(false);
    }
  };

  const handleSibmit = () => {
    setIsLoading(true);

    const body = {
      photos: [
        selectedImageApi,
        selectedImageTwoApi,
        selectedImageThreeApi,
        selectedImageFourApi,
        selectedImageFiveApi,
        selectedImageSixApi,
      ],
    };

    console.log("body handleSibmit", body);

    BusinessService.BusinessImages(businessDetails?.businessId, body)
      .then((res) => {
        console.log(res);
        navigation.navigate("ThankYouBus");
        // navigation.navigate("ThankYouBus", {
        //   orgData: router?.params?.orgData,
        // });
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const handlePermissionClose = () => {
    setShowStoragePermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowStoragePermissionModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
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
              {/* <ProfileHeader /> */}
              <Image
                source={require("../../../assets/busniessicon.png")}
                style={styles.orglogo}
                resizeMode="contain"
              />
              <Image
                source={require("../../../assets/camera.png")}
                style={styles.camlogo}
              />
              <Text allowFontScaling={false} style={styles.subHeaderText}>
                {i18n.t("BusinesPhoto.text")}
              </Text>
              <TouchableOpacity
                onPress={handleImagePick}
                style={{ width: "12%", alignSelf: "center" }}
              >
                {selectedImage ? (
                  <>
                    {uploadingOne ? (
                      <View style={styles.image}>
                        <Loader />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.image}
                      />
                    )}
                  </>
                ) : (
                  <Image
                    source={require("../../../assets/uplodeimagee.jpg")}
                    style={styles.image}
                  />
                )}
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.subbHeaderText}>
                {i18n.t("BusinesPhoto.textone")}
              </Text>
              <View style={styles.additionalPhotosContainer}>
                <TouchableOpacity onPress={handleImagePickTwo}>
                  {selectedImageTwo ? (
                    <>
                      {uploadingTwo ? (
                        <Loader />
                      ) : (
                        <Image
                          source={{ uri: selectedImageTwo }}
                          style={styles.imageextra}
                        />
                      )}
                    </>
                  ) : (
                    <Image
                      source={require("../../../assets/uplodeimagee.jpg")}
                      style={styles.imageextra}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImagePickThree}>
                  {selectedImageThree ? (
                    <>
                      {uploadingThree ? (
                        <Loader />
                      ) : (
                        <Image
                          source={{ uri: selectedImageThree }}
                          style={styles.imageextra}
                        />
                      )}
                    </>
                  ) : (
                    <Image
                      source={require("../../../assets/uplodeimagee.jpg")}
                      style={styles.imageextra}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImagePickFour}>
                  {selectedImageFour ? (
                    <>
                      {uploadingFour ? (
                        <Loader />
                      ) : (
                        <Image
                          source={{ uri: selectedImageFour }}
                          style={styles.imageextra}
                        />
                      )}
                    </>
                  ) : (
                    <Image
                      source={require("../../../assets/uplodeimagee.jpg")}
                      style={styles.imageextra}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImagePickFive}>
                  {selectedImageFive ? (
                    <>
                      {uploadingFive ? (
                        <Loader />
                      ) : (
                        <Image
                          source={{ uri: selectedImageFive }}
                          style={styles.imageextra}
                        />
                      )}
                    </>
                  ) : (
                    <Image
                      source={require("../../../assets/uplodeimagee.jpg")}
                      style={styles.imageextra}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImagePickSix}>
                  {selectedImageSix ? (
                    <>
                      {uploadingSix ? (
                        <Loader />
                      ) : (
                        <Image
                          source={{ uri: selectedImageSix }}
                          style={styles.imageextra}
                        />
                      )}
                    </>
                  ) : (
                    <Image
                      source={require("../../../assets/uplodeimagee.jpg")}
                      style={styles.imageextra}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      position: "absolute",
                      alignItems: "center",
                      alignSelf: "center",
                      bottom: 40,
                    }}
                  >
                    <ActivityIndicator size={50} color="#0000ff" />
                  </View>
                </>
              ) : (
                <>
                  {isKeyboardOpen ? null : (
                    <TouchableOpacity
                      disabled={isDisable}
                      onPress={handleSibmit}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        position: "absolute",
                        alignItems: "center",
                        alignSelf: "center",
                        bottom: 20,
                      }}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity
                          disabled={isDisable}
                          onPress={handleSibmit}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={styles.textbtn}
                            >
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

export default BusinesPhoto;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 55,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    // paddingTop: 15,
    // marginBottom: 15,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginHorizontal: 25,
  },
  subbHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginHorizontal: 25,
    paddingTop: 15,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  imageextra: {
    width: 70,
    height: 70,
    borderRadius: 7,
  },
  additionalPhotosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    gap: 10,
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
    height: 90,
    top: -10,
  },
  camlogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 80,
    marginTop: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
