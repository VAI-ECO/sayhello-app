import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import OrganizationService from "../../../Services/OrganizationService";
import Loader from "../../../Component/Loader";
import facebookLogo from "../../../assets/facebook.png";
import instagramLogo from "../../../assets/insta.png";
import tiktokLogo from "../../../assets/yelp.png";
import youtubeLogo from "../../../assets/youtube.png";
import linkedinLogo from "../../../assets/linkedin.png";
import twitterLogo from "../../../assets/x.png";

import reviewImage1 from "../../../assets/yelp.png";
import reviewImage2 from "../../../assets/google (2).png";
import reviewImage3 from "../../../assets/bbb.png";
import Icon from "react-native-vector-icons/Entypo";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const OrgSocial = () => {
  // const router = useRoute();
  const OrganizationData = useSelector(
    (state) => state?.organization?.organizationData
  );
  console.log(OrganizationData?._id, "data org2");

  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socials, setSocials] = useState([
    {
      type: "Facebook",
      link: "",
      logoUrl: facebookLogo,
    },
    {
      type: "Instagram",
      link: "",
      logoUrl: instagramLogo,
    },
    {
      type: "TikTok",
      link: "",
      logoUrl: tiktokLogo,
    },
    {
      type: "YouTube",
      link: "",
      logoUrl: youtubeLogo,
    },
    {
      type: "LinkedIn",
      link: "",
      logoUrl: linkedinLogo,
    },
    {
      type: "Twitter",
      link: "",
      logoUrl: twitterLogo,
    },
  ]);

  const [reviews, setReviews] = useState([
    {
      type: "Yelp",
      link: "",
      imageUrl: reviewImage1,
    },
    {
      type: "Google",
      link: "",
      imageUrl: reviewImage2,
    },
    {
      type: "BBB",
      link: "",
      imageUrl: reviewImage3,
    },
  ]);

  const handleNext = () => {
    setIsLoading(true);
    const data = {
      socials,
    };

    console.log("Data: ", data);

    console.log(OrganizationData?._id, "data org");

    // OrganizationService.addGroupSocial(router?.params?.orgId, socials)
    OrganizationService.addGroupSocial(OrganizationData?._id, socials)
      .then((res) => {
        console.log("Res: ", res);
        navigation.navigate("OrgSummary");
        // navigation.navigate("OrgSummary", {
        //   orgId: router?.params?.orgId,
        // });
        setSocials("");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Err: ", err);
        setIsLoading(false);
      });
    // OrganizationService.addGroupReview(router?.params?.orgId, reviews)
    OrganizationService.addGroupReview(OrganizationData?._id, reviews)
      .then((res) => {
        console.log("Res: ", res);
        navigation.navigate("OrgSummary");
        // navigation.navigate("OrgSummary", {
        //   orgId: router?.params?.orgId,
        // });
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Err: ", err?.message);
        setIsLoading(false);
      });
  };

  const handleSocialChange = (index, value) => {
    const newSocials = [...socials];
    newSocials[index].link = value;
    setSocials(newSocials);
  };

  const handleReviewChange = (index, value) => {
    const newReviews = [...reviews];
    newReviews[index].link = value;
    setReviews(newReviews);
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../../assets/ImageBackground.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.container}>
              {/* <Header title="" /> */}
              <Image
                source={require("../../../assets/orglogo.png")}
                style={styles.orglogo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.title}>
                {i18n.t("global.social")}
              </Text>
              {socials &&
                socials.map((social, index) => (
                  <View style={styles.row} key={index}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={social.logoUrl}
                        style={styles.socialLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <TextInput
                      allowFontScaling={false}
                      style={styles.input}
                      placeholder={social.type}
                      value={social.link}
                      onChangeText={(text) => handleSocialChange(index, text)}
                    />
                  </View>
                ))}

              <Text allowFontScaling={false} style={styles.title}>
                {i18n.t("global.reviews")}
              </Text>
              {reviews.map((review, index) => (
                <View style={styles.row} key={index}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={review.imageUrl}
                      style={styles.reviewImage}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    allowFontScaling={false}
                    style={styles.input}
                    placeholder={review.type}
                    value={review.link}
                    onChangeText={(text) => handleReviewChange(index, text)}
                  />
                </View>
              ))}
            </ScrollView>
            {isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>
                {!isKeyboardOpen && (
                  <View style={styles.footer}>
                    <TouchableOpacity
                      onPress={goBack}
                      style={styles.buttonContainer}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <View style={styles.buttonContent}>
                          <Icon
                            name="chevron-left"
                            size={25}
                            color="#fff"
                            style={{ paddingTop: 3 }}
                          />
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.back")}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleNext}
                      style={styles.buttonContainer}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <View style={styles.buttonContent}>
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.next")}
                          </Text>
                          <Icon
                            name="chevron-right"
                            size={25}
                            color="#fff"
                            style={{ paddingTop: 3 }}
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default OrgSocial;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    right: 0,
    bottom: 0,
    flex: 1,
    left: 0,
    top: 0,
  },
  container: {
    flexGrow: 1,
    paddingTop: 55,
    paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#EDF5F4",
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: "Roboto-Bold",
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
    marginTop: 8,
    alignSelf: "center",
    justifyContent: "center",
  },
  textbtn: {
    color: "white",
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    fontSize: 17,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignSelf: "center",
    width: "100%",
    paddingVertical: 10,
  },
  buttonContainer: {
    width: "45%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  reviewImage: {
    width: 40,
    height: 40,
  },
  socialLogo: {
    width: 40,
    height: 40,
  },
});
