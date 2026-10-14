import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ActivityIndicatorBase,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { useLocation } from "../../../Context/LocationContext";
import { useAuth } from "../../../Context/AuthContext";
import LocationPermissionModal from "../../../Component/LocationPermissionModal";

function generateRandomName(extension = "png") {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  const randomName = `${timestamp}_${randomString}.${extension}`; // Combine timestamp, random string, and extension
  return randomName;
}

const TakeSelfi = () => {
  const route = useRoute();
  const cameraRef = useRef();
  const { location } = useLocation();
  const { user, endNotificationFlow } = useAuth();
  const { seconduserid } = route.params;
  const navigation = useNavigation();

  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [FormDataImage, setFormDataImage] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  // if (!permission) {
  //   return <View />;
  // }

  useEffect(() => {
    if (!permission?.granted) {
      setShowPermissionModal(true);
      requestPermission();
    }
  }, []);

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const CaptureImage = async () => {
    try {
      let photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo);
      // handleImageUpload(photo);
      setIsLoading(true);

      let name = generateRandomName("png");

      console.log("name", name);
      console.log("photo uri is: ", photo?.uri);
      const formData = new FormData();
      if (photo?.uri) {
        formData.append("file", {
          uri: photo?.uri,
          name: name,
          type: "image/png",
        });
      }
      setFormDataImage(formData);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = (formData) => {
    setIsLoading(true);
    axios
      .post(`https://api.sayhello.world/api/v1/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("response of the image upload: ", res);
        let body = {
          firstUserId: user?.user?._id,
          secondUserId: seconduserid,
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
          selfieUrl: res?.data?.response_body?.Location,
        };
        console.log(
          "body that we are sending towards the  add connection: ",
          body
        );
        axios
          .post(`https://api.sayhello.world/api/v1/connection/create`, body)
          .then((res) => {
            console.log("response of add connection is: ", res);
            navigation.navigate("Connections");
            console.log("djshkjsahdkjsahkds");
            endNotificationFlow();
            setIsLoading(false);
          })
          .catch((err) => {
            console.log("error in connection", err);
            // setIsLoading(false);
          });
      })
      .catch((err) => {
        console.log("error in API UPLOAD", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const handleImageUpload = (photo) => {
  //   console.log();

  //   setIsLoading(true);

  //   let name = generateRandomName("png");

  //   console.log("name", name);

  //   const formData = new FormData();
  //   if (photo?.uri) {
  //     formData.append("file", {
  //       uri: photo?.uri,
  //       name: name,
  //       type: "image/png",
  //     });
  //   }
  //   axios
  //     .post(`https://api.sayhello.world/api/v1/upload`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     })
  //     .then((res) => {
  //       console.log("response of the image upload: ", res);
  //       let body = {
  //         firstUserId: user?.user?._id,
  //         secondUserId: seconduserid,
  //         latitude: location?.coords?.latitude,
  //         longitude: location?.coords?.longitude,
  //         selfieUrl: res?.data?.response_body?.Location,
  //       };
  //       console.log(
  //         "body that we are sending towards the  add connection: ",
  //         body
  //       );
  //       axios
  //         .post(`https://api.sayhello.world/api/v1/connection/create`, body)
  //         .then((res) => {
  //           console.log("response of add connection is: ", res);
  //           navigation.navigate("Connections");
  //           console.log("djshkjsahdkjsahkds");
  //           endNotificationFlow();
  //           setIsLoading(false);
  //         })
  //         .catch((err) => {
  //           console.log("error in connection", err);
  //           // setIsLoading(false);
  //         });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       setIsLoading(false);
  //     });
  // };

  const handleConfirm = async () => {
    setIsModalVisible(false);
    uploadImage(FormDataImage);
    navigation.navigate("Home");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    navigation.navigate("Home");
  };

  const handleSend = () => {
    setIsModalVisible(true);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handlePermissionClose = () => {
    setShowPermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowPermissionModal(false);
    requestPermission();
  };

  return (
    <>
      {showPermissionModal ? (
        <LocationPermissionModal
          visible={showPermissionModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (
        <View style={styles.container}>
          {capturedImage ? (
            <View style={styles.capturedImageContainer}>
              <Image
                source={{ uri: capturedImage.uri }}
                style={styles.capturedImage}
              />
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing="front"
              ref={cameraRef}
            ></CameraView>
          )}

          {capturedImage ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleRetake}>
                <Text style={styles.actionButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                CaptureImage();
              }}
              disabled={isLoading}
              style={styles.captureButton}
            >
              {/* {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : ( */}
              {/* )} */}
              <AntDesign name="camerao" size={45} color="#fff" />
            </TouchableOpacity>
          )}
          <Modal
            visible={isModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Consent to Appear on the Map</Text>
                <Text style={styles.modalMessage}>
                  By selecting "Yes," you grant TimeToSayHello permission to
                  publicly display your selfie on our platform's virtual map. This
                  image will be accessible to all users and may be used for
                  promotional purposes. If you select "No," your location and selfie
                  will not be displayed on the map. You may withdraw your consent at
                  any time by contacting us at{" "}
                  <Text style={styles.email}>info@sayhello.world</Text>.
                </Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[styles.modalButton]}
                  >
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[styles.modalButton]}
                  >
                    <Text style={styles.buttonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* <CameraView
        // style={styles.camera}
        // style={StyleSheet.absoluteFillObject}
        facing={facing}
        // ratio="1:1"
        // style={{ height: height }}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                CaptureImage();
              }}
              disabled={isLoading}
              style={{
                position: "absolute",
                bottom: 20,
                alignSelf: "center",
                width: 80,
                height: 80,
                backgroundColor: "#DB2E25",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <AntDesign name="camerao" size={45} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView> */}
        </View>
      )}
    </>
  );
};

export default TakeSelfi;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  camera: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    // margin: 30,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "justify",
  },
  email: {
    color: "#007BFF",
    textDecorationLine: "underline",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#338AFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  captureButton: {
    marginTop: 30,
    backgroundColor: "#338AFF",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  capturedImageContainer: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  buttonRow: {
    flexDirection: "column",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#338AFF",
    alignItems: "center",
    width: "80%",
    // marginHorizontal: 5,
    marginVertical: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
});
