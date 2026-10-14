import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import * as DocumentPicker from "expo-document-picker";
import userService from "../../Services/userService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../Context/AuthContext";
import { UploadDocument } from "../../Context/helper";
import i18n from "../../Context/i18n";

const Embassadordetails = () => {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const businessName = router?.params?.businessName;
  const fromsecond = router?.params?.fromsecond;

  console.log(
    from,
    from2,
    from3,
    from4,
    fromsecond,
    pathname,
    businessName,
    "p5"
  );

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      console.log("result", result?.assets?.[0]?.uri);

      if (result?.assets?.[0]) {
        setDocument(result.assets[0]);

        let result_document = await UploadDocument(result.assets[0]);

        if (result_document?.response_message === "Success" && result_document?.response_body?.Location) {
          await userService
            .markingAmbsidor({
              userId: user?.user?._id,
              w9FormLink: result_document.response_body.Location,
            })
            .then((res) => {
              console.log("Response: ", res?.user?.isAmbesdor);
              const updates = {
                isAmbesdor: res?.user?.isAmbesdor,
              };
              updateUser(updates);
              navigation.navigate("Home");
              setIsLoading(false);
            })
            .catch((err) => {
              console.log("Error: ", err);
              Alert.alert("Upload failed", "Your document could not be submitted. Please try again.");
              setIsLoading(false);
            });
        } else {
          Alert.alert("Upload failed", "Your document could not be uploaded. Please try again.");
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Upload failed", "Please try selecting your document again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handelOpenLink = () => {
    const link = `https://www.irs.gov/pub/irs-pdf/fw9.pdf?ver=2024030813`;
    Linking.openURL(link).catch((err) =>
      console.error("Failed to open link:", err)
    );
  };

  const handleBack = () => {
    if (!from4) { navigation.goBack(); return; }
    navigation.navigate(from4, {
      from: from,
      from2: from2,
      from3: from3,
      fromsecond: fromsecond,
      businessName: businessName,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          flex: 1,
          left: 0,
          top: 0,
        }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <ProfileHeader handleBack={handleBack} />
            <Image
              style={styles.icon}
              source={require("../../assets/megapho.png")}
            />
            <Image
              style={styles.Hello}
              source={require("../../assets/Say Hello Ambassador.png")}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("global.sayHelloAmbassadorJoinGig")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.text")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("global.SayHello")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.textone")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("global.whatWeOffer")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.texttwo")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("global.YourRole")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.textthree")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.ReadytoGetStarted")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.textfour")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.textfive")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.textsix")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.textsaven")}eight
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.texteight")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.textnine")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              {i18n.t("Embassadordetails.textten")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              {i18n.t("Embassadordetails.ReviewandSubmit")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
                textAlign: "center",
                marginHorizontal: 22,
                marginBottom: 25,
              }}
            >
              {i18n.t("Embassadordetails.texteleven")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 22,
                marginBottom: 10,
              }}
            >
              <TouchableOpacity>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#338AFF",
                    marginBottom: 10,
                    textDecorationLine: "underline",
                  }}
                >
                  {i18n.t("global.discountlink")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#338AFF",
                    marginBottom: 10,
                    textDecorationLine: "underline",
                  }}
                >
                  {i18n.t("global.UserAgreement")}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 22,
              }}
            >
              <TouchableOpacity>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#338AFF",
                    marginBottom: 10,
                    textDecorationLine: "underline",
                  }}
                >
                  {i18n.t("global.link")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handelOpenLink()}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#338AFF",
                    marginBottom: 10,
                    textDecorationLine: "underline",
                  }}
                >
                  {i18n.t("global.W9-Form")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: "Roboto-Bold",
              fontSize: 18,
              fontWeight: "bold",
              color: "#000000",
              textAlign: "center",
              marginTop: "55%",
            }}
          >
            {i18n.t("global.Upload")}
          </Text>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <TouchableOpacity
              style={{ width: "20%", alignSelf: "center" }}
              onPress={handleSubmit}
              // onPress={pickDocument}
            >
              <Image
                style={{
                  resizeMode: "contain",
                  alignSelf: "center",
                  top: -10,
                }}
                source={require("../../assets/uplodedpdf.png")}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Embassadordetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    height: "10%",
  },
  Hello: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "62%",
  },
});
import { Linking } from "react-native";
