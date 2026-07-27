import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, BackHandler, SafeAreaView, KeyboardAvoidingView } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";
import LocationPermissionModal from "../../../Component/LocationPermissionModal";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [data, setData] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.getCameraPermissionsAsync();

      if (status !== "granted") {
        setShowPermissionModal(true);
      }
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useEffect(() => {
    let toastTimeout;
    if (scanned) {
      Toast.show({
        type: "success",
        text1: "Scan Complete",
        autoHide: true,
        visibilityTime: 1000,
      });
      toastTimeout = setTimeout(() => setScanned(false), 1000);
    }

    return () => clearTimeout(toastTimeout);
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log("scanneddata is: ", data);
    setData(data);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const handlePermissionClose = () => {
    setShowPermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowPermissionModal(false);
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  // if (hasPermission === null) {
  //   return <Text>Requesting for camera permission</Text>;
  // }
  // if (hasPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }

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
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            style={{ flex: 1, width: "100%" }}
          />
          {scanned && (
            <>
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
                style={{
                  position: "absolute",
                  bottom: 20,
                  alignSelf: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 50,
                  borderRadius: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("TakeSelfi", {
                      seconduserid: data,
                    });
                  }}
                >
                  <Text style={{ color: "white", fontSize: 18 }}>
                    {i18n.t("global.takeSelfie")}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}

        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  },
});
